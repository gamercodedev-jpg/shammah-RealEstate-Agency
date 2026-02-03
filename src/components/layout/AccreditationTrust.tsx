export function AccreditationTrust() {
  return (
    <section className="w-full bg-white">
      <div className="container py-12">
        <div className="rounded-2xl border-2 border-accent/50 bg-white p-6 md:p-10 shadow-sm">
          <div className="rounded-xl border border-primary/30 bg-white px-6 py-10">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="inline-flex items-center rounded-full border border-primary/25 bg-primary/5 px-4 py-1 text-xs font-medium tracking-wide text-foreground">
                Accreditation &amp; Trust
              </div>

              <img
                src="/ziea-logo.png"
                alt="Zambia Institute of Estate Agents (ZIEA)"
                className="h-[100px] w-auto object-contain drop-shadow-sm"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "/ziea-logo.svg";
                }}
              />

              <div className="space-y-3 max-w-3xl">
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                  A Registered and Regulated Real Estate Firm
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  shamah Real Estate is a proud, certified member of the Zambia Institute of Estate Agents (ZIEA). We
                  operate under a strict code of conduct to ensure transparency, legal compliance, and total security for
                  our local and Diaspora clients.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
