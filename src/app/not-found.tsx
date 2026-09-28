import { SiteChrome } from "@/components/layout/SiteFrame";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  // A 404 can be reached at any URL, so this sits at the app root rather
  // than inside the (site) group, and brings the public chrome with it.
  //
  // `SiteChrome` rather than `SiteFrame`: Next serializes this boundary into
  // the payload of every route under the root layout, /admin included, so
  // keeping GA4 out of it is what stops the measurement ID appearing in an
  // admin response.
  return (
    <SiteChrome>
      <Container className="py-28 text-center">
        <p className="eyebrow text-gold-deep">404</p>
        <h1 className="display mt-4 text-5xl text-navy">This page has already been cleared.</h1>
        <p className="mx-auto mt-4 max-w-md text-stone">
          The link may have moved. Start from the homepage or request an estimate.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button href="/">Back home</Button>
          <Button href="/estimate" variant="ghost">
            Get Free Estimate
          </Button>
        </div>
      </Container>
    </SiteChrome>
  );
}
