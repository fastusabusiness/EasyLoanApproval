// Easy Loan Approval brand mark — navy + green dollar-bill emblem, from
// /public/logo.jpg. Clipped to a circle so the JPG's white corners
// disappear. The `animated` prop is accepted for call-site compatibility;
// motion (float/glow) is applied by the parent wrapper on the homepage.

export default function BrandLogo({
  className = "h-10 w-10",
}: {
  className?: string;
  animated?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.jpg"
      alt="Easy Loan Approval"
      className={`rounded-full object-cover ${className}`}
    />
  );
}
