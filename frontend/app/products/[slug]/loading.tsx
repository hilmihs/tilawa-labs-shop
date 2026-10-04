export default function PDPLoading() {
  return (
    <>
      <div style={{ padding: "20px 40px" }}>
        <div className="tn-skeleton" style={{ width: 220, height: 11 }} />
      </div>
      <section style={{ padding: "24px 40px 80px" }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 56 }}
          className="pdp-skel-grid"
        >
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="tn-skeleton" style={{ width: 80, height: 96 }} />
              ))}
            </div>
            <div className="tn-skeleton" style={{ width: "100%", aspectRatio: "4/5" }} />
          </div>
          <div>
            <div className="tn-skeleton" style={{ width: 160, height: 11, marginBottom: 14 }} />
            <div className="tn-skeleton" style={{ width: "90%", height: 56, marginBottom: 18 }} />
            <div className="tn-skeleton" style={{ width: 200, height: 36, marginBottom: 22 }} />
            <div className="tn-skeleton" style={{ width: "100%", height: 1, marginBottom: 22 }} />
            <div className="tn-skeleton" style={{ width: "100%", height: 18, marginBottom: 8 }} />
            <div className="tn-skeleton" style={{ width: "85%", height: 18, marginBottom: 8 }} />
            <div className="tn-skeleton" style={{ width: "70%", height: 18, marginBottom: 28 }} />
            <div className="tn-skeleton" style={{ width: "100%", height: 56 }} />
          </div>
        </div>
        <style>{`
          @media (max-width: 1024px) {
            .pdp-skel-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>
    </>
  );
}
