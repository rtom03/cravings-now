import { prisma } from "../utils/db";
import { str } from "../services/order/order.validation";
// import { syncAllProductModifiers } from "../services/foodics/modifier.service";
// import { syncBranches } from "../services/foodics/branches.service";
const mapProduct = (product) => {
    return {
        id: product.id,
        sku: product.sku,
        foodicsId: product.foodicsId,
        foodicsSandBoxId: product.foodicsSandBoxId,
        barcode: product.barcode,
        name: product.name,
        image: product.image,
        nameLocalized: product.nameLocalized,
        description: product.description,
        price: product.price,
        isActive: product.isActive,
        isStockProduct: product?.isStockProduct,
        isNonRevenue: product?.isNonRevenue,
        isReady: product?.isReady,
        pricingMethod: product.pricingMethod,
        sellingMethod: product.sellingMethod,
        costingMethod: product.costingMethod,
        cost: product.cost,
        calories: product.calories,
        walkingMinutesToBurnCalories: product.walkingMinutesToBurnCalories,
        isHighSalt: product.isHighSalt,
        meta: product.meta,
        reactivateAt: product.reactivateAt,
        category: product?.category,
        groupName: product.groupName,
        mostLoved: product.mostLoved,
        isPromotion: product.isPromotion,
        modifiers: product.groupProductModifiers.map((groupProductModifier) => ({
            id: groupProductModifier.modifier.id,
            name: groupProductModifier.modifier.name,
            minimumOptions: groupProductModifier.minimumOptions,
            maximumOptions: groupProductModifier.maximumOptions,
            options: groupProductModifier.modifier.options.map((option) => option.modifierOption),
        })),
    };
};
const getGroups = async (req, res) => {
    try {
        const groups = await prisma.group.findMany();
        res.status(201).json(groups);
    }
    catch (error) {
        console.log(error);
        res.status(500).json(`An err occured while fetching data ${error}`);
    }
};
const getGroup = async (req, res) => {
    const { groupName } = req.query;
    try {
        const group = await prisma.group.findFirst({
            where: { name: { contains: str(groupName), mode: "insensitive" } },
        });
        res.status(201).json(group);
    }
    catch (error) {
        console.log(error);
        res.status(500).json(`An err occured while fetching data ${error}`);
    }
};
const getBranchByGroupName = async (req, res) => {
    const { id } = req.params;
    try {
        const group = await prisma.group.findUnique({ where: { id: id } });
        if (!group) {
            return res.status(404).json({
                message: "Group not found",
            });
        }
        const branches = await prisma.branch.findMany({
            where: {
                name: {
                    contains: group?.name,
                    mode: "insensitive",
                },
            },
        });
        res.status(201).json({ branches });
    }
    catch (error) {
        console.log(error);
        res.status(500).json(`An err occured while fetching data ${error}`);
    }
};
const getProductsByGroupName = async (req, res) => {
    const { id } = req.params;
    try {
        const group = await prisma.group.findUnique({
            where: { id: id },
            select: { name: true },
        });
        if (!group) {
            return res.status(404).json({
                message: "Group not found",
            });
        }
        // console.log(group.name);
        const products = await prisma.groupProducts.findMany({
            where: {
                groupName: {
                    contains: group?.name,
                    mode: "insensitive",
                },
            },
            include: {
                category: true,
                groupProductModifiers: {
                    include: {
                        modifier: {
                            include: {
                                options: {
                                    where: {
                                        modifierOption: {
                                            isActive: true,
                                        },
                                    },
                                    include: {
                                        modifierOption: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        // res.status(201).json({ products });
        const mappedProducts = products.map(mapProduct);
        res.status(200).json(mappedProducts);
    }
    catch (error) {
        console.log(error);
        res.status(500).json(`An err occured while fetching data ${error}`);
    }
};
const getProducts = async (req, res) => {
    try {
        const products = await prisma.groupProducts.findMany({
            where: { isActive: true, mostLoved: true, isPromotion: true },
            include: {
                category: true,
                groupProductModifiers: {
                    include: {
                        modifier: {
                            include: {
                                options: {
                                    where: {
                                        modifierOption: {
                                            isActive: true,
                                        },
                                    },
                                    include: {
                                        modifierOption: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        const mappedProducts = products.map(mapProduct);
        res.status(200).json(mappedProducts);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "An error occurred while fetching products",
        });
    }
};
// syncAllProductModifiers();
// syncBranches();
// syncTaxGroup();
// syncTax();
// syncGrpEp();
// syncGroup("9c1e4e06-5000-4603-ab30-b0ca5f146b51");
// syncProductLiveToSandbox("Scoopd");
// syncCategoriesLiveToSandbox();
// appendCatIdGrpPrd();
// syncCategories();
// syncSandboxIdsByName();
// syncModifierOptionsForModifier("a2ce85b6-3514-4005-91b6-45c8f4281fd7");
export { getGroups, getGroup, getBranchByGroupName, getProductsByGroupName, getProducts, };
