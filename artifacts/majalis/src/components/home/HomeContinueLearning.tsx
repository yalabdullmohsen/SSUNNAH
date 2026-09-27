/**
 * متابعة التعلّم — أولوية عليا: آخر موضع قراءة + CTA واحد.
 */
import { Link } from "wouter";
import { HomeLocalResumeCard } from "@/components/home/HomeLocalResumeCard";
import "@/styles/components/home-continue-learning.css";

export function HomeContinueLearning() {
  return (
    <section
      className="hcl"
      aria-labelledby="home-continue-title"
      data-testid="home-continue-learning"
    >
      <div className="hcl__head">
        <div>
          <h2 id="home-continue-title" className="hcl__title">
            أكمل من حيث توقفت
          </h2>
          <p className="hcl__sub">آخر درس أو صفحة قراءة محفوظة على جهازك</p>
        </div>
        <Link href="/my-learning" className="hcl__cta">
          حسابي
        </Link>
      </div>
      <HomeLocalResumeCard />
    </section>
  );
}
