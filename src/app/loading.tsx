import HamsterLoading from "@/components/ui/HamsterLoading";

export default function Loading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.25rem",
        background:
          "linear-gradient(135deg, #fdf6f0 0%, #fef0fa 40%, #f0f4ff 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: "0.5rem",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            background: "linear-gradient(135deg, #60a5fa, #8b5cf6)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M4.5 11c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm11 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-5.5-4c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-3 14c0-3.3 2.7-6 6-6s6 2.7 6 6H7z" />
          </svg>
        </div>
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.4rem",
            fontWeight: 600,
            color: "#1e1a2e",
          }}
        >
          Vet<span style={{ color: "#a78bfa" }}>alist</span>
        </span>
      </div>
      <HamsterLoading />
      <p style={{ fontSize: "0.875rem", color: "#9ca3af", fontWeight: 300 }}>
        Hang tight, waking up your furry friends...
      </p>
    </div>
  );
}
