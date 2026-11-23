import { Request, Response } from "express";
import { syncBranches } from "../services/foodics/branches.service.js";
import { FoodicsBranch } from "../types/index.types.js";
import { prisma } from "../utils/db.js";

export type IDParams = {
  id: string;
};

const getBranch = async (req: Request<IDParams>, res: Response) => {
  const { id } = req.params;
  try {
    const branch = await prisma.branch.findUnique({
      where: {
        id: id,
      },
      include: {
        branchCategories: {
          include: {
            category: {
              include: {
                groupProducts: true,
              },
            },
          },
        },
      },
    });
    return res.json(branch);
  } catch (error: any) {
    console.error("Failed to fetch branches:", error);
    return res.status(500).json({
      message: error?.message || "Failed to fetch branches",
    });
  }
};

const getBranches = async (req: Request, res: Response) => {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { name: "asc" },
    });
    return res.json({ branches });
  } catch (error: any) {
    console.error("Failed to fetch branches:", error);
    return res.status(500).json({
      message: error?.message || "Failed to fetch branches",
    });
  }
};

/// upsert

// getActiveTaxGroup();

export { getBranch, getBranches };
