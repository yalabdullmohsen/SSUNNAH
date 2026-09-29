import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import "@/styles/components/scholar-follow.css";
import {
  followSheikh,
  unfollowSheikh,
  isFollowingSheikh,
  getFollowerCount,
} from "@/lib/scholar-follow-service";
import { Button } from "@/components/ui/button";

type Props = {
  sheikhId: string;
  compact?: boolean;
};

export function ScholarFollowButton({ sheikhId, compact = false }: Props) {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [following, setFollowing] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sheikhId || authLoading) return;
    getFollowerCount(sheikhId).then(setCount).catch(() => {});
    if (isLoggedIn && user?.id) {
      isFollowingSheikh(user.id, sheikhId).then(setFollowing).catch(() => {});
    } else {
      setFollowing(false);
    }
  }, [sheikhId, authLoading, isLoggedIn, user?.id]);

  if (authLoading || !isLoggedIn) return null;

  const toggle = async () => {
    if (!user?.id || loading) return;
    setLoading(true);
    try {
      if (following) {
        await unfollowSheikh(user.id, sheikhId);
        setFollowing(false);
        setCount((c) => (c !== null ? Math.max(0, c - 1) : c));
      } else {
        await followSheikh(user.id, sheikhId);
        setFollowing(true);
        setCount((c) => (c !== null ? c + 1 : c));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={following ? "secondary" : "outline"}
      size="small"
      className={`scholar-follow-btn${following ? " scholar-follow-btn--following" : ""}${compact ? " scholar-follow-btn--compact" : ""}`}
      onClick={toggle}
      disabled={loading}
      loading={loading}
      aria-label={following ? "إلغاء المتابعة" : "تابع هذا الشيخ"}
    >
      {following ? "✓ تتابعه" : "＋ تابع"}
      {count !== null && !compact && (
        <span className="scholar-follow-btn__count">{count}</span>
      )}
    </Button>
  );
}
