import { Prisma, Page } from "@prisma/client";
import { PageRepository } from "../repository/PageRepository";
import { SyncQueueService } from "./SyncQueueService";
import { computeContentHash } from "../utils/hashUtils";
import { NotFoundError } from "../src/errors/customErrors";

export class PageService {
  private readonly repository: PageRepository;
  private readonly syncQueueService: SyncQueueService;

  constructor(repository: PageRepository, syncQueueService: SyncQueueService) {
    this.repository = repository;
    this.syncQueueService = syncQueueService;
  }

  async createPage(data: Prisma.PageCreateInput): Promise<Page> {
    if (!data.pageName || !data.application) {
        throw new Error('Page name and application are required');
    }

    // Compute hash of page content (if provided)
    let localHash: string | undefined;
    if (data.pageContent) {
      localHash = await computeContentHash(data.pageContent);
    }

    const page = await this.repository.create({
      ...data,
      ...(localHash && { localHash }),
    });

    // Enqueue sync for the newly created page
    await this.syncQueueService.enqueueSync(page.applicationID, 'PAGE', page.id, 'CREATE');

    return page;
  }

  async getPageById(id: string, applicationId?: string): Promise<Page> {
    const page = await this.repository.findById(id, applicationId);
    if (!page) {
        throw new NotFoundError("Page not found");
    }
    return page;
  }

  async getPagesByApplicationId(applicationID: string): Promise<Page[]> {
    const pages = await this.repository.findByApplicationId(applicationID);
    return pages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async updatePage(id: string, applicationID: string, data: Prisma.PageUpdateInput): Promise<Page> {
    // 1. Compute hash of new page content (if provided)
    let localHash: string | undefined;
    if (data.pageContent) {
      localHash = await computeContentHash(data.pageContent);
    }

    // 2. Update the page (include localHash in the update data)
    const updatedPage = await this.repository.update(id, applicationID, {
      ...data,
      ...(localHash && { localHash }),
    });

    // 3. Enqueue sync entry for this page
    await this.syncQueueService.enqueueSync(applicationID, 'PAGE', id, 'UPDATE');

    return updatedPage;
  }

  async deletePage(id: string, applicationID: string): Promise<Page> {
    return this.repository.delete(id, applicationID);
  }
}