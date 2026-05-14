import express from "express";
import { generateProject } from "../utils/project-generator";
import { Request, Response } from "express";
import { authenticateJWT, checkApplicationOwnership } from "../middleware/auth";
const router = express.Router();

/**
 * @swagger
 * /download/{id}:
 *   post:
 *     summary: Download an existing application
 *     tags: [App Generation]
 *     description: Generates and downloads an existing React application as a zip file.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the application to download.
 *     responses:
 *       200:
 *         description: A zip file of the generated application.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Error processing request.
 */
router.post("/download/:id", [authenticateJWT, checkApplicationOwnership], async (req: Request, res: Response) => {
  const { id } = req.params;

  await generateProject(id, '1', res);
});

export = router;