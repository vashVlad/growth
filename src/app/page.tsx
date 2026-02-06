import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: 'var(--background)'
    }}>
      <div style={{ marginBottom: '2rem', width: '120px', height: '120px', position: 'relative' }}>
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--primary)',
          borderRadius: '24px',
          transform: 'rotate(-5deg)',
          opacity: 0.2,
          position: 'absolute',
          top: 0,
          left: 0
        }} />
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--primary)',
          borderRadius: '24px',
          transform: 'rotate(10deg)',
          opacity: 0.4,
          position: 'absolute',
          top: 0,
          left: 0
        }} />
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          position: 'relative',
          zIndex: 10
        }}>
          🌱
        </div>
      </div>

      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        color: 'var(--primary)'
      }}>
        Growth Book
      </h1>

      <p style={{
        fontSize: '1.25rem',
        color: 'var(--foreground-muted)',
        marginBottom: '3rem',
        maxWidth: '300px',
        lineHeight: 1.6
      }}>
        Your daily companion for reflection, clarity, and personal growth.
      </p>

      <Link
        href="/today"
        className="btn-primary"
        style={{
          fontSize: '1.125rem',
          padding: '1rem 3rem',
          textDecoration: 'none',
          boxShadow: '0 4px 14px 0 rgba(74, 124, 89, 0.39)'
        }}
      >
        Start Journaling
      </Link>
    </div>
  );
}
