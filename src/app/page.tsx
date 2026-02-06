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
      <div style={{ marginBottom: '2rem', position: 'relative' }}>
        <Image
          src="/logo.png"
          alt="Growth Book Logo"
          width={220}
          height={220}
          priority
          style={{
            objectFit: 'contain',
            borderRadius: '24px' // Optional: matches previous aesthetic if desired, or remove if logo already has shape
          }}
        />
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
