import { prisma } from "../utils/db";
const getBranch = async (req, res) => {
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
    }
    catch (error) {
        console.error("Failed to fetch branches:", error);
        return res.status(500).json({
            message: error?.message || "Failed to fetch branches",
        });
    }
};
const getBranches = async (req, res) => {
    try {
        const branches = await prisma.branch.findMany({
            orderBy: { name: "asc" },
        });
        return res.json({ branches });
    }
    catch (error) {
        console.error("Failed to fetch branches:", error);
        return res.status(500).json({
            message: error?.message || "Failed to fetch branches",
        });
    }
};
/// upsert
// getActiveTaxGroup();
export { getBranch, getBranches };
