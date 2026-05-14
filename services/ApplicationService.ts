import { Prisma, Application, PrismaClient } from '@prisma/client';
import { NotFoundError } from '../src/errors/customErrors';
import { ApplicationRepository } from '../repository/ApplicationRepository';
import { UserApplicationMapRepository } from '../repository/UserApplicationMapRepository';
import { ResourceService } from './ResourceService';
import { ResourceRepository } from '../repository/ResourceRepository';
import { PageRepository } from '../repository/PageRepository';
import { ApplicationEnumRepository } from '../repository/ApplicationEnumRepository';
import { CustomComponentRepository } from '../repository/CustomComponentRepository';
import { WorkflowRepository } from '../repository/WorkflowRepository';
import { InputJsonValue } from '@prisma/client/runtime/library';
import { hashUnitContent } from '../src/utils/hashUtils';
import { computeContentHash } from '../utils/hashUtils';
import { SyncQueueService } from './SyncQueueService';
import { app } from '../server';

export class ApplicationService {
  private readonly prisma: PrismaClient;
  private readonly applicationRepository: ApplicationRepository;
  private readonly userApplicationMapRepository: UserApplicationMapRepository;
  private readonly resourceRepository: ResourceRepository;
  private readonly pageRepository: PageRepository;
  private readonly applicationEnumRepository: ApplicationEnumRepository;
  private readonly customComponentRepository: CustomComponentRepository;
  private readonly workflowRepository: WorkflowRepository;
  private readonly syncQueueService: SyncQueueService;

  constructor(
    prisma: PrismaClient,
    applicationRepository: ApplicationRepository,
    userApplicationMapRepository: UserApplicationMapRepository,
    resourceRepository: ResourceRepository,
    syncQueueService: SyncQueueService,
    pageRepository: PageRepository,
    applicationEnumRepository: ApplicationEnumRepository,
    customComponentRepository: CustomComponentRepository,
    workflowRepository: WorkflowRepository
  ) {
    this.prisma = prisma;
    this.applicationRepository = applicationRepository;
    this.userApplicationMapRepository = userApplicationMapRepository;
    this.resourceRepository = resourceRepository;
    this.syncQueueService = syncQueueService;
    this.pageRepository = pageRepository;
    this.applicationEnumRepository = applicationEnumRepository;
    this.customComponentRepository = customComponentRepository;
    this.workflowRepository = workflowRepository;
  }

  async createApplicationWithUserMapping(
    userId: string,
    applicationData: Prisma.ApplicationCreateInput
  ): Promise<Application> {
    // Business validation
    if (!applicationData.name) {
      throw new Error('Name is required');
    }

    const application = await this.applicationRepository.create(applicationData);

    await this.userApplicationMapRepository.create({
      user: { connect: { id: userId } },
      application: { connect: { id: application.id } },
    });

    let attr: InputJsonValue = {
      resource: 'Users',
      fieldValues: [
        {
          name: 'id',
          type: 'String',
          required: true,
          is_file: false,
          is_enum: false,
          foreign_field: ''
        },
        {
          name: 'user_name',
          type: 'String',
          required: true,
          is_file: false,
          is_enum: false,
          foreign_field: ''
        },
        {
          name: 'user_email',
          type: 'String',
          required: true,
          is_file: false,
          is_enum: false,
          foreign_field: ''
        }
      ]
    }

    const dataToHash = { resourceName: "Users", attributes: attr };

    const localHash = await computeContentHash(dataToHash);

    // Create default user resource
    const resource = await this.resourceRepository.create({
      resourceName: "Users",
      attributes: attr,
      localHash,
      application: { connect: { id: application.id } },
    });
    await this.syncQueueService.enqueueSync(resource.applicationID, 'RESOURCE', resource.id, 'CREATE');

    return application;
  }

  async getApplicationById(id: string): Promise<Application> {
    const app = await this.applicationRepository.findById(id);
    if (!app) {
      throw new NotFoundError('Application not found');
    }
    return app;
  }

  // async getApplicationsByUserId(userId: string) {
  //   const localApps = await this.userApplicationMapRepository.findApplicationsByUserId(userId);

  //   try {
  //     const centralApps = await this.fetchCentralApplications(userId);
  //     const mergedApps = [...localApps];

  //     for (const centralApp of centralApps) {
        
  //       // Check if application already exists locally (matched by remoteAppId or id)
  //       let localApp = localApps.find(a => a.remoteAppId === centralApp.appid || a.id === centralApp.appid);

  //       // if (!localApp) {
  //       // If not owner, auto-import
  //       if (centralApp.owner_id !== userId) {
  //         localApp = await this.importCentralApplication(userId, centralApp);
  //         mergedApps.push(localApp);
  //         // } 
  //         // else {
  //         //   // If owner but not local, we might want to show it or import it.
  //         //   // Requirement says "If same return the response", which is ambiguous.
  //         //   // For now, we'll just include it in the merged list.
  //         //   mergedApps.push({
  //         //     id: centralApp.appid,
  //         //     name: centralApp.appname,
  //         //     description: centralApp.appdescription || '',
  //         //     isShared: true,
  //         //     remoteAppId: centralApp.appid,
  //         //     baseVersion: parseInt(centralApp.applicationVersion, 10) || 1,
  //         //     createdAt: new Date().toISOString() // Placeholder or use modified_time if available
  //         //   } as any);
  //         // }
  //       }
  //     }

  //     return mergedApps;
  //   } catch (error) {
  //     console.error("Failed to fetch/merge central applications:", error);
  //     return localApps; // Fallback to local apps if central fetch fails
  //   }
  // }

  async getApplicationsByUserId(userId: string) {
  const localApps = await this.userApplicationMapRepository.findApplicationsByUserId(userId);

  try {
    const centralApps = await this.fetchCentralApplications(userId);

    // ✅ Step 1: Create central ID set
    const centralAppIds = new Set(centralApps.map(app => app.appid));

    // ✅ Step 2: Remove stale shared apps
    const filteredLocalApps = localApps.filter(app => {
      if (!app.isShared) return true; // owned apps stay
      return centralAppIds.has(app.remoteAppId);
    });

    const mergedApps = [...filteredLocalApps];

    // ✅ Step 3: Import missing shared apps
    for (const centralApp of centralApps) {
      let localApp = filteredLocalApps.find(
        a => a.remoteAppId === centralApp.appid || a.id === centralApp.appid
      );

      if (!localApp && centralApp.owner_id !== userId) {
        localApp = await this.importCentralApplication(userId, centralApp);
        mergedApps.push(localApp);
      }
    }

    return mergedApps;

  } catch (error) {
    console.error("Failed to fetch/merge central applications:", error);
    return localApps;
  }
}

  private async fetchCentralApplications(userId: string): Promise<any[]> {
    const COLLABORATION_URL = process.env.COLLABORATION_URL || 'http://localhost:8082/api';
    const response = await fetch(`${COLLABORATION_URL}/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Token": process.env.INTERNAL_TOKEN || "internal-secret-token",
      },
    });

    if (!response.ok) {
      throw new Error(`Central backend error: ${response.statusText}`);
    }

    return await response.json();
  }

  private async importCentralApplication(userId: string, centralApp: any) {
    // 1. Create the Local Application
    const application = await this.applicationRepository.create({
      id: centralApp.appid, // Use the same appId
      name: centralApp.appname,
      description: centralApp.appdescription || '',
      isShared: true,
      remoteAppId: centralApp.appid,
      baseVersion: parseInt(centralApp.applicationVersion, 10) || 1,
    });

    // 2. Create User mapping
    await this.userApplicationMapRepository.create({
      user: { connect: { id: userId } },
      application: { connect: { id: application.id } },
    });

    // 3. Create Units
    if (centralApp.units && Array.isArray(centralApp.units)) {
      for (const unit of centralApp.units) {
        const content = typeof unit.content === 'string' ? JSON.parse(unit.content) : unit.content;
        const unitData: any = {
          id: unit.unitId,
          serverHash: unit.hash,
          localHash: unit.hash,
          syncVersion: 1,
          lastSyncedAt: new Date(),
          application: { connect: { id: application.id } },
        };

        if (unit.unitType === 'Page') {
          await this.pageRepository.create({
            ...unitData,
            pageName: unit.name,
            pageContent: content,
          });
        } else if (unit.unitType === 'Resource' || unit.unitType === 'Component') {
          await this.resourceRepository.create({
            ...unitData,
            resourceName: unit.name,
            attributes: content,
          });
        } else if (unit.unitType === 'Enum') {
          await this.applicationEnumRepository.create({
            ...unitData,
            enumName: unit.name,
            enums: content,
          });
        } else if (unit.unitType === 'CustomComponent') {
          // Custom components are linked to user, not app, but the schema shows they are standalone
          await this.customComponentRepository.create({
            id: unit.unitId,
            user: { connect: { id: userId } },
            componentName: unit.name,
            componentContent: content,
            serverHash: unit.hash,
            localHash: unit.hash,
            syncVersion: 1,
            lastSyncedAt: new Date(),
          });
        } else if (unit.unitType === 'Workflow') {
          await this.workflowRepository.create({
            ...unitData,
            workflowName: unit.name,
            workflowData: content,
            generatedWorkflowIds: [], // Default empty
          });
        }
      }
    }

    return application;
  }

  async getAllApplications(): Promise<Application[]> {
    return this.applicationRepository.findAll();
  }

  async updateApplication(
    id: string,
    data: Prisma.ApplicationUpdateInput
  ): Promise<Application> {
    await this.getApplicationById(id);
    return this.applicationRepository.update(id, data);
  }

  async deleteApplication(id: string, userId: string): Promise<Application> {
    const application = await this.getApplicationById(id);

    if (application.isShared && application.remoteAppId) {
      const COLLABORATION_URL = process.env.COLLABORATION_URL || 'http://localhost:8082/api';
      try {
        const response = await fetch(`${COLLABORATION_URL}/delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Token': process.env.INTERNAL_TOKEN || 'internal-secret-token'
          },
          body: JSON.stringify({
            application_id: application.remoteAppId,
            user_id: userId
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = response.statusText;
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
          } catch (e) {
            errorMessage = errorText || errorMessage;
          }
          throw new Error(`${errorMessage}`);
        }

        const result = await response.json();
        // Requirement: check that appID in applications remoted_id and delete all entries of the the application
        // result.appID is expected from central server response.
        if (result.application_id !== application.remoteAppId) {
          console.warn(`Central server deleted appID ${result.application_id} does not match expected remoteAppId ${application.remoteAppId}`);
        }
      } catch (error: any) {
        console.error("Failed to delete application from central server:", error);
        throw error;
      }
    }

    // Manual cleanup for tables without cascading delete (like SyncQueue)
    await this.prisma.syncQueue.deleteMany({
      where: { applicationId: id }
    });

    return this.applicationRepository.delete(id);
  }

  /**
   * Share an application: collects all units, builds the Central Server payload,
   * sends it to the central server, and updates the local application with the response.
   */
  async shareApplication(applicationId: string, userId: string) {
    // Step 1 — Fetch the application and validate
    const application = await this.getApplicationById(applicationId);
    if (application.isShared) {
      throw new Error('Application is already shared');
    }

    // Step 2 — Fetch all units in parallel
    const [pages, resources, enums, customComponents, workflows] = await Promise.all([
      this.pageRepository.findByApplicationId(applicationId),
      this.resourceRepository.findByApplicationId(applicationId),
      this.applicationEnumRepository.findByApplicationId(applicationId),
      this.customComponentRepository.findByUserId(userId),
      this.workflowRepository.findByApplicationId(applicationId),
    ]);

    // Step 3 — Build unified units array for the central backend
    const units: any[] = [];

    pages.forEach((p: any) => units.push({
      unitId: p.id,
      unitType: 'Page',
      name: p.pageName,
      content: JSON.stringify(p.pageContent),
      hash: p.localHash || ''
    }));

    resources.forEach((r: any) => units.push({
      unitId: r.id,
      unitType: 'Resource',
      name: r.resourceName,
      content: JSON.stringify(r.attributes),
      hash: r.localHash || ''
    }));

    enums.forEach((e: any) => units.push({
      unitId: e.id,
      unitType: 'Enum',
      name: e.enumName,
      content: JSON.stringify(e.enums),
      hash: e.localHash || ''
    }));

    customComponents.forEach((c: any) => units.push({
      unitId: c.id,
      unitType: 'CustomComponent',
      name: c.componentName,
      content: JSON.stringify(c.componentContent),
      hash: c.localHash || ''
    }));

    workflows.forEach((w: any) => units.push({
      unitId: w.id,
      unitType: 'Workflow',
      name: w.workflowName,
      content: JSON.stringify(w.workflowData),
      hash: w.localHash || ''
    }));

    // Step 4 — Prepare and send request to Central Backend
    const centralPayload = {
      appId: application.id,
      name: application.name,
      description: application.description,
      ownerId: userId,
      units,
    };

    const COLLABORATION_URL = process.env.COLLABORATION_URL || 'http://localhost:8082/api';

    try {
      const response = await fetch(`${COLLABORATION_URL}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Token': process.env.INTERNAL_TOKEN || 'internal-secret-token'
        },
        body: JSON.stringify(centralPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Central Backend error: ${errorText || response.statusText}`);
      }

      const result = await response.json();

      // Step 5 — Update local database with central backend information
      await this.applicationRepository.update(applicationId, {
        isShared: true,
        remoteAppId: result.newAppId,
        baseVersion: parseInt(result.applicationVersion, 10) || 1,
        lastSyncedAt: new Date()
      });

      // Optionally update unit details if the central server returns them
      if (result.units && Array.isArray(result.units)) {
        for (const remoteUnit of result.units) {
          const updateData: any = {
            serverHash: remoteUnit.hash,
            syncVersion: parseInt(remoteUnit.unit_version, 10) || 1,
            lastSyncedAt: new Date()
          };

          if (remoteUnit.unitType === 'Page') {
            await this.pageRepository.update(remoteUnit.unitId, applicationId, updateData);
          } else if (remoteUnit.unitType === 'Resource') {
            await this.resourceRepository.update(remoteUnit.unitId, applicationId, updateData);
          } else if (remoteUnit.unitType === 'Enum') {
            await this.applicationEnumRepository.update(remoteUnit.unitId, applicationId, updateData);
          } else if (remoteUnit.unitType === 'CustomComponent') {
            await this.customComponentRepository.update(remoteUnit.unitId, updateData);
          } else if (remoteUnit.unitType === 'Workflow') {
            await this.workflowRepository.update(remoteUnit.unitId, updateData);
          }
        }
      }

      return result;
    } catch (error: any) {
      console.error("Failed to share application with central server:", error);
      throw error;
    }
  }

  /**
   * Invite a collaborator to a shared application.
   */
  async inviteCollaborator(applicationId: string, inviteData: { userId: string, role: string, invited_by: string }) {
    // Step 1 — Fetch the application and validate
    const application = await this.getApplicationById(applicationId);
    if (!application.isShared || !application.remoteAppId) {
      throw new Error('Application must be shared before inviting collaborators');
    }

    const COLLABORATION_URL = process.env.COLLABORATION_URL || 'http://localhost:8082/api';

    try {
      const response = await fetch(`${COLLABORATION_URL}/${application.remoteAppId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Token': process.env.INTERNAL_TOKEN || 'internal-secret-token'
        },
        body: JSON.stringify(inviteData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        // throw new Error(`Central Backend error: ${errorText || response.statusText}`);
       let errorMessage = response.statusText;
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
          } catch (e) {
            errorMessage = errorText || errorMessage;
          }
          throw new Error(`${errorMessage}`);
      }


      return await response.json();
    } catch (error: any) {
      console.error("Failed to invite collaborator via central server:", error);
      throw error;
    }
  }

  /**
   * Synchronize application changes with the central server.
   * Only sends content for units that have local changes (localHash !== serverHash).
   * Handles 409 Conflict responses.
   */
  async syncApplication(applicationId: string, userId: string, omitUnits: boolean = false, comment: string = '') {
    // Step 1 — Fetch the application and validate
    const application = await this.getApplicationById(applicationId);
    if (!application.isShared || !application.remoteAppId) {
      throw new Error('Application must be shared before syncing');
    }

    // Step 2 — Fetch all units in parallel
    const [pages, resources, enums, customComponents, workflows] = await Promise.all([
      this.pageRepository.findByApplicationId(applicationId),
      this.resourceRepository.findByApplicationId(applicationId),
      this.applicationEnumRepository.findByApplicationId(applicationId),
      this.customComponentRepository.findByUserId(userId),
      this.workflowRepository.findByApplicationId(applicationId),
    ]);

    // Step 3 — Build Units array for the central backend
    // Only include units that are new (serverHash null) or modified (localHash !== serverHash).
    const units: any[] = [];

    if (!omitUnits) {
      const processUnit = (u: any, type: string, nameField: string, contentField: string) => {
        // const isNew = !u.serverHash;
        // const isModified = u.localHash !== u.serverHash;

        // if (isNew || isModified) {
        units.push({
          unitId: u.id,
          unitType: type,
          name: u[nameField],
          version: u.syncVersion,
          content: JSON.stringify(u[contentField]),
          localhash: u.localHash || '',
          serverhash: u.serverHash || ''
        });
        // }
      };

      pages.forEach(p => processUnit(p, 'Page', 'pageName', 'pageContent'));
      resources.forEach(r => processUnit(r, 'Resource', 'resourceName', 'attributes'));
      enums.forEach(e => processUnit(e, 'Enum', 'enumName', 'enums'));
      customComponents.forEach(c => processUnit(c, 'CustomComponent', 'componentName', 'componentContent'));
      workflows.forEach(w => processUnit(w, 'Workflow', 'workflowName', 'workflowData'));
    }

    const COLLABORATION_URL = process.env.COLLABORATION_URL || 'http://localhost:8082/api';
    const syncPayload = {
      BaseVersion: application.baseVersion.toString(),
      Units: units,
      comment: comment,
    };

    try {
      const response = await fetch(`${COLLABORATION_URL}/${application.remoteAppId}/sync/unit?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Token': process.env.INTERNAL_TOKEN || 'internal-secret-token'
        },
        body: JSON.stringify(syncPayload)
      });

      if (response.status === 409) {
        // Handle Conflict
        const conflictData = await response.json();
        const error: any = new Error('Sync conflict occurred');
        error.status = 409;
        error.conflicts = conflictData; // This includes Message and conflicts array
        throw error;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Central Backend error: ${errorText || response.statusText}`);
      }

      const result = await response.json();

      // Step 4 — Update local database with response
      await this.applicationRepository.update(applicationId, {
        baseVersion: parseInt(result.Version, 10) || application.baseVersion,
        lastSyncedAt: new Date()
      });

      if (result.Units && Array.isArray(result.Units)) {
        for (const remoteUnit of result.Units) {
          const updateData: any = {
            serverHash: remoteUnit.hash,
            syncVersion: parseInt(remoteUnit.unit_version, 10) || 1,
            lastSyncedAt: new Date()
          };

          // If content is provided by server (e.g., successful merge or pull), update local content too
          if (remoteUnit.Content) {
            const parsedContent = typeof remoteUnit.Content === 'string' ? JSON.parse(remoteUnit.Content) : remoteUnit.Content;
            if (remoteUnit.unit_type === 'Page') {
              updateData.pageContent = parsedContent;
            } else if (remoteUnit.unit_type === 'Resource') {
              updateData.attributes = parsedContent;
            } else if (remoteUnit.unit_type === 'Enum') {
              updateData.enums = parsedContent;
            } else if (remoteUnit.unit_type === 'CustomComponent') {
              updateData.componentContent = parsedContent;
            } else if (remoteUnit.unit_type === 'Workflow') {
              updateData.workflowData = parsedContent;
            }
          }

          if (remoteUnit.unit_type === 'Page') {
            await this.pageRepository.update(remoteUnit.unit_id, applicationId, updateData);
          } else if (remoteUnit.unit_type === 'Resource') {
            await this.resourceRepository.update(remoteUnit.unit_id, applicationId, updateData);
          } else if (remoteUnit.unit_type === 'Enum') {
            await this.applicationEnumRepository.update(remoteUnit.unit_id, applicationId, updateData);
          } else if (remoteUnit.unit_type === 'CustomComponent') {
            await this.customComponentRepository.update(remoteUnit.unit_id, updateData);
          } else if (remoteUnit.unit_type === 'Workflow') {
            await this.workflowRepository.update(remoteUnit.unit_id, updateData);
          }
        }
      }

      return result;
    } catch (error: any) {
      if (error.status === 409) {
        throw error; // Re-throw to be handled by the route
      }
      console.error("Failed to sync application with central server:", error);
      throw error;
    }
  }

  /**
   * Fetch version history for a shared application from the central backend.
   */
  async getApplicationVersions(applicationId: string) {
    const application = await this.getApplicationById(applicationId);
    if (!application.isShared || !application.remoteAppId) {
      throw new Error('Application must be shared to fetch versions');
    }

    const COLLABORATION_URL = process.env.COLLABORATION_URL || 'http://localhost:8082/api';
    const response = await fetch(`${COLLABORATION_URL}/${application.remoteAppId}/versions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Token': process.env.INTERNAL_TOKEN || 'internal-secret-token'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Central Backend error: ${errorText || response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Rollback a shared application to a specific version.
   * Updates local units with the historical data returned by the central server.
   */
  async rollbackApplication(applicationId: string, version: string) {
    const application = await this.getApplicationById(applicationId);
    if (!application.isShared || !application.remoteAppId) {
      throw new Error('Application must be shared to perform rollback');
    }

    const COLLABORATION_URL = process.env.COLLABORATION_URL || 'http://localhost:8082/api';
    const response = await fetch(`${COLLABORATION_URL}/${application.remoteAppId}/rollback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Token': process.env.INTERNAL_TOKEN || 'internal-secret-token'
      },
      body: JSON.stringify({ Version_to_rollback: version })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Central Backend error: ${errorText || response.statusText}`);
    }

    const result = await response.json();
    console.log("result", result);

    // 1. Delete all existing units for this application to ensure local and server are in sync
    await Promise.all([
      (this.prisma as any).page.deleteMany({ where: { applicationID: applicationId } }),
      (this.prisma as any).resource.deleteMany({ where: { applicationID: applicationId } }),
      (this.prisma as any).applicationEnum.deleteMany({ where: { applicationID: applicationId } }),
      (this.prisma as any).workflow.deleteMany({ where: { applicationID: applicationId } }),
    ]);

    // 2. Insert units from the historical state returned by the central server
    if (result.Units && Array.isArray(result.Units)) {
      for (const unit of result.Units) {
        const content = typeof unit.Content === 'string' ? JSON.parse(unit.Content) : unit.Content;
        const unitData: any = {
          id: unit.Unit_id,
          serverHash: unit.Hash,
          localHash: unit.Hash, // Set local hash to match server hash after rollback
          // parse the syncVersion to Int
          syncVersion: Number(unit.Unit_version),
          // syncVersion: unit.Unit_version || 1, // Use unit_version provided in rollback response
          lastSyncedAt: new Date(),
        };

        if (unit.Unit_type === 'Page') {
          await this.pageRepository.create({
            ...unitData,
            pageName: unit.Unit_name,
            pageContent: content,
            application: { connect: { id: applicationId } }
          });
        } else if (unit.Unit_type === 'Resource') {
          await this.resourceRepository.create({
            ...unitData,
            resourceName: unit.Unit_name,
            attributes: content,
            application: { connect: { id: applicationId } }
          });
        } else if (unit.Unit_type === 'Enum') {
          await this.applicationEnumRepository.create({
            ...unitData,
            enumName: unit.Unit_name,
            enums: content,
            application: { connect: { id: applicationId } }
          });
        } else if (unit.Unit_type === 'CustomComponent') {
          // CustomComponent is linked to userId, not applicationId. 
          // We update/upsert it as it might belong to multiple applications or be user-wide.
          await this.customComponentRepository.update(unit.Unit_id, {
            ...unitData,
            componentContent: content,
          });
        } else if (unit.Unit_type === 'Workflow') {
          await this.workflowRepository.create({
            ...unitData,
            workflowName: unit.Unit_name,
            workflowData: content,
            generatedWorkflowIds: [], // Default empty or from server if available
            application: { connect: { id: applicationId } }
          });
        }
      }
    }

    // Update application base version
    await this.applicationRepository.update(applicationId, {
      baseVersion: parseInt(result.Version, 10) || application.baseVersion,
      lastSyncedAt: new Date()
    });

    return result;
  }

  /**
   * Forcefully synchronize specific units with the central server.
   * Overwrites server-side changes with local changes for the given unit IDs.
   */
  async forceSyncApplication(applicationId: string, userId: string, unitIds: string[]) {
    // Step 1 — Fetch the application and validate
    const application = await this.getApplicationById(applicationId);
    if (!application.isShared || !application.remoteAppId) {
      throw new Error('Application must be shared before syncing');
    }

    // Step 2 — Fetch all units in parallel
    const [pages, resources, enums, customComponents, workflows] = await Promise.all([
      this.pageRepository.findByApplicationId(applicationId),
      this.resourceRepository.findByApplicationId(applicationId),
      this.applicationEnumRepository.findByApplicationId(applicationId),
      this.customComponentRepository.findByUserId(userId),
      this.workflowRepository.findByApplicationId(applicationId),
    ]);

    // Step 3 — Build Units array for the force-sync call
    // Only include units that are in the unitIds list
    const units: any[] = [];

    const processUnit = (u: any, type: string, nameField: string, contentField: string) => {
      if (unitIds.includes(u.id)) {
        units.push({
          unitId: u.id,
          unitType: type,
          name: u[nameField],
          version: u.syncVersion,
          content: JSON.stringify(u[contentField]),
          localhash: u.localHash || '',
          serverhash: u.serverHash || ''
        });
      }
    };

    pages.forEach(p => processUnit(p, 'Page', 'pageName', 'pageContent'));
    resources.forEach(r => processUnit(r, 'Resource', 'resourceName', 'attributes'));
    enums.forEach(e => processUnit(e, 'Enum', 'enumName', 'enums'));
    customComponents.forEach(c => processUnit(c, 'CustomComponent', 'componentName', 'componentContent'));
    workflows.forEach(w => processUnit(w, 'Workflow', 'workflowName', 'workflowData'));

    if (units.length === 0) {
      throw new Error('No units specified for force sync found in local database');
    }

    const COLLABORATION_URL = process.env.COLLABORATION_URL || 'http://localhost:8082/api';
    const forceSyncPayload = {
      BaseVersion: application.baseVersion.toString(),
      Units: units,
    };

    try {
      const response = await fetch(`${COLLABORATION_URL}/${application.remoteAppId}/forceSync?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Token': process.env.INTERNAL_TOKEN || 'internal-secret-token'
        },
        body: JSON.stringify(forceSyncPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Central Backend error: ${errorText || response.statusText}`);
      }

      const result = await response.json();

      // Step 4 — Update local database with response
      await this.applicationRepository.update(applicationId, {
        baseVersion: parseInt(result.Version, 10) || application.baseVersion,
        lastSyncedAt: new Date()
      });

      if (result.Units && Array.isArray(result.Units)) {
        for (const remoteUnit of result.Units) {
          const updateData: any = {
            serverHash: remoteUnit.Hash,
            localHash: remoteUnit.Hash, // Set local hash to match server hash after force sync
            syncVersion: parseInt(remoteUnit.Unit_version, 10) || 1,
            lastSyncedAt: new Date()
          };

          if (remoteUnit.Unit_type === 'Page') {
            await this.pageRepository.update(remoteUnit.Unit_id, applicationId, updateData);
          } else if (remoteUnit.Unit_type === 'Resource') {
            await this.resourceRepository.update(remoteUnit.Unit_id, applicationId, updateData);
          } else if (remoteUnit.Unit_type === 'Enum') {
            await this.applicationEnumRepository.update(remoteUnit.Unit_id, applicationId, updateData);
          } else if (remoteUnit.Unit_type === 'CustomComponent') {
            await this.customComponentRepository.update(remoteUnit.Unit_id, updateData);
          } else if (remoteUnit.Unit_type === 'Workflow') {
            await this.workflowRepository.update(remoteUnit.Unit_id, updateData);
          }
        }
      }

      return result;
    } catch (error: any) {
      console.error("Failed to force-sync application with central server:", error);
      throw error;
    }
  }

  /**
   * Fetch specific conflicting units from the server and overwrite local versions.
   */
  async syncToServer(applicationId: string, userId: string, conflictUnitIds: string[]) {
    const application = await this.getApplicationById(applicationId);
    if (!application.isShared || !application.remoteAppId) {
      throw new Error('Application must be shared before syncing');
    }

    const COLLABORATION_URL = process.env.COLLABORATION_URL || 'http://localhost:8082/api';
    const payload = {
      baseVersion: application.baseVersion.toString(),
      conflict_unit_ids: conflictUnitIds
    };

    try {
      const response = await fetch(`${COLLABORATION_URL}/${application.remoteAppId}/syncToServer?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Token': process.env.INTERNAL_TOKEN || 'internal-secret-token'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Central Backend error: ${errorText || response.statusText}`);
      }

      const result = await response.json();

      // Update local database with response
      await this.applicationRepository.update(applicationId, {
        baseVersion: parseInt(result.Version, 10) || application.baseVersion,
        lastSyncedAt: new Date()
      });

      if (result.Units && Array.isArray(result.Units)) {
        for (const remoteUnit of result.Units) {
          const updateData: any = {
            serverHash: remoteUnit.hash,
            localHash: remoteUnit.hash,
            syncVersion: parseInt(remoteUnit.unit_version, 10) || 1,
            lastSyncedAt: new Date()
          };

          const contentData = remoteUnit.content || remoteUnit.Content;
          if (contentData) {
            const parsedContent = typeof contentData === 'string' ? JSON.parse(contentData) : contentData;
            if (remoteUnit.unit_type === 'Page') {
              updateData.pageContent = parsedContent;
            } else if (remoteUnit.unit_type === 'Resource' || remoteUnit.unit_type === 'Component') {
              updateData.attributes = parsedContent;
            } else if (remoteUnit.unit_type === 'Enum') {
              updateData.enums = parsedContent;
            } else if (remoteUnit.unit_type === 'CustomComponent') {
              updateData.componentContent = parsedContent;
            } else if (remoteUnit.unit_type === 'Workflow') {
              updateData.workflowData = parsedContent;
            }
          }

          if (remoteUnit.unit_type === 'Page') {
            await this.pageRepository.update(remoteUnit.unit_id, applicationId, updateData);
          } else if (remoteUnit.unit_type === 'Resource' || remoteUnit.unit_type === 'Component') {
            await this.resourceRepository.update(remoteUnit.unit_id, applicationId, updateData);
          } else if (remoteUnit.unit_type === 'Enum') {
            await this.applicationEnumRepository.update(remoteUnit.unit_id, applicationId, updateData);
          } else if (remoteUnit.unit_type === 'CustomComponent') {
            await this.customComponentRepository.update(remoteUnit.unit_id, updateData);
          } else if (remoteUnit.unit_type === 'Workflow') {
            await this.workflowRepository.update(remoteUnit.unit_id, updateData);
          }
        }
      }

      return result;
    } catch (error: any) {
      console.error("Failed to sync to server (pull specific units):", error);
      throw error;
    }
  }
}

