import User from "../models/user.js";

// Recursive function to build a referral tree
export const buildReferralTree = async (userId) => {
    const user = await User.findById(userId).select("_id referralCode");
    if (!user) return null;

    // Find all direct referrals
    const directReferrals = await User.find({ referrer: userId }).select("_id referralCode");

    // Recursively build the referral tree
    const tree = await Promise.all(
        directReferrals.map(async (child) => ({
            _id: child._id,
            referralCode: child.referralCode,
            referralTree: await buildReferralTree(child._id),
        }))
    );

    return tree.filter(Boolean); // Remove null/undefined values
};
