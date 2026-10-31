import crypto from "crypto";
import { insertUser, findUserByEmail, readTable } from "../../src/server/db";
import { hashPassword, createToken } from "../../src/server/auth";

function generateReferralCode(): string {
  return crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();
}

function createSellerProfile() {
  return {
    isSeller: false,
    sellerPlan: null,
    sellerPlanStatus: "inactive",
    sellerPlanExpiresAt: null,
    sellerSubscriptionReference: null,
    sellerRenewalReminderSentAt: null,
    sellerFrozenAt: null,
    sellerFreezeReason: null,
    sellerRenewalPaymentReference: null,

    sellerStoreName: "",
    sellerStoreSlug: "",
    sellerDescription: "",
    sellerLogoUrl: "",

    sellerMarkup: 0,

    sellerSupportEmail: "",
    sellerWhatsappLink: "",

    sellerPayoutEmail: "",
    sellerPayoutAccountName: "",
    sellerPayoutAccountNumber: "",
    sellerPayoutBankCode: "",
  };
}

function publicUser(user: Record<string, any>) {
  const {
    passwordHash,
    passwordResetTokenHash,
    passwordResetTokenExpiresAt,
    ...safe
  } = user;

  return safe;
}

export default async function handler(
  req: any,
  res: any
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const {
      name,
      email,
      password,
      referralCode,
    } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "name, email and password are required",
      });
    }

    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    const existingUser =
      await findUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        error:
          "An account with that email already exists",
      });
    }

    const users = await readTable<Record<string, any>>(
      "users"
    );

    let referredBy = null;

    if (referralCode) {
      const normalizedReferralCode = String(
        referralCode
      )
        .trim()
        .toUpperCase();

      const referrer = users.find(
        (user) =>
          user.referralCode ===
          normalizedReferralCode
      );

      if (referrer) {
        referredBy = referrer.id;
      }
    }

    const adminEmail = (
      process.env.ADMIN_EMAIL || ""
    )
      .trim()
      .toLowerCase();

    const newUser = {
      id: crypto.randomUUID(),

      name: String(name).trim(),

      ...createSellerProfile(),

      email: normalizedEmail,

      passwordHash: hashPassword(
        String(password)
      ),

      walletBalance: 0,

      isAdmin:
        adminEmail !== "" &&
        normalizedEmail === adminEmail,

      purchasedItemIds: [],

      referralCode:
        generateReferralCode(),

      referredBy,

      referralRewardProcessed: false,

      createdAt:
        new Date().toISOString(),
    };

    await insertUser(newUser);

    const token = createToken(newUser);

    return res.status(201).json({
      token,
      user: publicUser(newUser),
    });
  } catch (error) {
    console.error(
      "Signup error:",
      error
    );

    return res.status(500).json({
      error:
        "Unable to create account right now. Please try again.",
    });
  }
}