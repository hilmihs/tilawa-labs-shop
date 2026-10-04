export default function HomeLoading() {
  return (
    <section style={{ padding: "64px 40px 80px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.15fr 0.85fr",
          gap: 48,
          alignItems: "end"
        }}
        className="skeleton-hero"
      >
        <div style={{ paddingBottom: 24 }}>
          <div className="tn-skeleton" style={{ width: 240, height: 14, marginBottom: 28 }} />
          <div className="tn-skeleton" style={{ width: "100%", height: 96, marginBottom: 14 }} />
          <div className="tn-skeleton" style={{ width: "85%", height: 96, marginBottom: 14 }} />
          <div className="tn-skeleton" style={{ width: "60%", height: 96, marginBottom: 28 }} />
          <div className="tn-skeleton" style={{ width: "70%", height: 18, marginBottom: 8 }} />
          <div className="tn-skeleton" style={{ width: "55%", height: 18 }} />
        </div>
        <div className="tn-skeleton" style={{ width: "100%", height: 560 }} />
      </div>

      <div style={{ marginTop: 96, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }} className="skeleton-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="tn-skeleton" style={{ width: "100%", aspectRatio: "4/5", marginBottom: 16 }} />
            <div className="tn-skeleton" style={{ width: "40%", height: 11, marginBottom: 10 }} />
            <div className="tn-skeleton" style={{ width: "85%", height: 22, marginBottom: 14 }} />
            <div className="tn-skeleton" style={{ width: "50%", height: 14 }} />
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .skeleton-hero { grid-template-columns: 1fr !important; }
          .skeleton-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
