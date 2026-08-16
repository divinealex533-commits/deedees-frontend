import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Gift,
  Link2,
  Share2,
  Users,
  WalletCards,
} from 'lucide-react';

type AffiliateProgramProps = {
  onBack: () => void;
};

type ReferralData = {
  referralCode: string;
  totalReferred: number;
  successfulReferrals: number;
  totalEarned: number;
};

export default function AffiliateProgram({
  onBack,
}: AffiliateProgramProps) {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadAffiliateData = async () => {
      try {
        const response = await fetch('/api/my-referrals');

        if (!response.ok) {
          throw new Error('Unable to load affiliate information');
        }

        const result = await response.json();

        setData({
          referralCode:
            result.referralCode ||
            result.referral_code ||
            result.code ||
            '',
          totalReferred:
            result.totalReferred ??
            result.total_referred ??
            result.total ??
            0,
          successfulReferrals:
            result.successfulReferrals ??
            result.successful_referrals ??
            0,
          totalEarned:
            result.totalEarned ??
            result.total_earned ??
            result.earnings ??
            0,
        });
      } catch (error) {
        console.error('Affiliate loading error:', error);

        /*
         * Keep the page usable even if the referral endpoint
         * is temporarily unavailable.
         */
        setData({
          referralCode: '',
          totalReferred: 0,
          successfulReferrals: 0,
          totalEarned: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadAffiliateData();
  }, []);

  const referralLink = data?.referralCode
    ? `${window.location.origin}/?ref=${encodeURIComponent(
        data.referralCode,
      )}`
    : '';

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const copyLink = async () => {
    if (!referralLink) return;

    try {
      await navigator.clipboard.writeText(referralLink);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const shareLink = async () => {
    if (!referralLink) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "DeeDee's Marketplace",
          text: "Join me on DeeDee's Marketplace.",
          url: referralLink,
        });
      } catch {
        // User closed the share dialog.
      }
    } else {
      await copyLink();
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      {/* HERO */}

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[700px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* BACK */}

          <button
            type="button"
            onClick={onBack}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-600
              transition
              hover:border-emerald-300
              hover:text-emerald-600
              dark:border-slate-800
              dark:bg-slate-900
              dark:text-slate-300
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </button>

          {/* HEADER */}

          <div className="mx-auto mt-10 max-w-3xl text-center">
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-emerald-200
                bg-emerald-50
                px-4
                py-2
                text-xs
                font-bold
                text-emerald-700
                dark:border-emerald-500/30
                dark:bg-emerald-500/10
                dark:text-emerald-400
              "
            >
              <Gift className="h-4 w-4" />
              Affiliate Program
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Share DeeDee's.
              <span className="block bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                Earn rewards.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg dark:text-slate-400">
              Invite people to DeeDee's Marketplace using your personal
              referral link and track your referral activity.
            </p>
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />

              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Loading your affiliate information...
              </p>
            </div>
          ) : (
            <>
              {/* STATS */}

              <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-3">
                <StatCard
                  icon={<Users className="h-5 w-5" />}
                  title="People Referred"
                  value={String(data?.totalReferred ?? 0)}
                />

                <StatCard
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  title="Successful Referrals"
                  value={String(
                    data?.successfulReferrals ?? 0,
                  )}
                />

                <StatCard
                  icon={<WalletCards className="h-5 w-5" />}
                  title="Total Earned"
                  value={formatMoney(
                    data?.totalEarned ?? 0,
                  )}
                />
              </div>

              {/* REFERRAL LINK */}

              <div
                className="
                  mx-auto
                  mt-8
                  max-w-5xl
                  rounded-3xl
                  border
                  border-emerald-200
                  bg-white
                  p-5
                  shadow-sm
                  sm:p-7
                  dark:border-emerald-500/20
                  dark:bg-slate-900
                "
              >
                <div className="flex items-start gap-3">
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      bg-emerald-50
                      text-emerald-600
                      dark:bg-emerald-500/10
                      dark:text-emerald-400
                    "
                  >
                    <Link2 className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold">
                      Your Referral Link
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Share this link with people you want to
                      invite.
                    </p>
                  </div>
                </div>

                {/* CODE */}

                {data?.referralCode && (
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Referral Code
                    </p>

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-mono text-sm font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                      {data.referralCode}
                    </div>
                  </div>
                )}

                {/* LINK */}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <div
                    className="
                      min-w-0
                      flex-1
                      rounded-2xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      py-3
                      font-mono
                      text-sm
                      text-slate-700
                      dark:border-slate-700
                      dark:bg-slate-950
                      dark:text-slate-300
                    "
                  >
                    {referralLink ? (
                      <span className="block truncate">
                        {referralLink}
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        Referral link unavailable
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={copyLink}
                    disabled={!referralLink}
                    className="
                      inline-flex
                      min-h-12
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      bg-gradient-to-r
                      from-emerald-500
                      to-teal-400
                      px-5
                      font-bold
                      text-white
                      shadow-lg
                      shadow-emerald-500/20
                      transition
                      hover:-translate-y-0.5
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}

                    {copied ? 'Copied' : 'Copy Link'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={shareLink}
                  disabled={!referralLink}
                  className="
                    mt-4
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    font-semibold
                    text-emerald-600
                    transition
                    hover:text-emerald-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    dark:text-emerald-400
                  "
                >
                  <Share2 className="h-4 w-4" />
                  Share Referral Link
                </button>
              </div>

              {/* HOW IT WORKS */}

              <div className="mx-auto mt-12 max-w-5xl">
                <div className="text-center">
                  <p className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    How It Works
                  </p>

                  <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                    Earn by sharing DeeDee's
                  </h2>
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-3">
                  <StepCard
                    number="01"
                    icon={<Link2 className="h-5 w-5" />}
                    title="Get Your Link"
                    text="Copy your personal referral link from your affiliate dashboard."
                  />

                  <StepCard
                    number="02"
                    icon={<Users className="h-5 w-5" />}
                    title="Invite People"
                    text="Share your link with friends, customers, or anyone who may use DeeDee's Marketplace."
                  />

                  <StepCard
                    number="03"
                    icon={<Gift className="h-5 w-5" />}
                    title="Earn Rewards"
                    text="Track successful referrals and your affiliate earnings from this page."
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div
      className="
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      <div
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          bg-emerald-50
          text-emerald-600
          dark:bg-emerald-500/10
          dark:text-emerald-400
        "
      >
        {icon}
      </div>

      <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-2xl font-black tracking-tight">
        {value}
      </p>
    </div>
  );
}

function StepCard({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div
      className="
        relative
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-sm
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      <span className="absolute right-5 top-4 text-4xl font-black text-slate-100 dark:text-slate-800">
        {number}
      </span>

      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {text}
      </p>
    </div>
  );
}
