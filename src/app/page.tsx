import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
      background: 'linear-gradient(135deg, var(--background) 0%, #F0F4F0 100%)',
    }}>
      <div style={{ marginBottom: '2rem', width: '120px', height: '120px', position: 'relative' }}>
        {/* Placeholder for icon if I had one, or just text */}
        <div style={{
          width: '100%', height: '100%', borderRadius: '24px',
          backgroundColor: 'var(--primary)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '3rem'
        }}>
          🌿
        </div>
      </div>

      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: 'var(--primary)',
        marginBottom: '0.5rem'
      }}>
        Growth Book
      </h1>

      <p style={{
        fontSize: '1.125rem',
        color: '#666',
        marginBottom: '3rem',
        maxWidth: '300px'
      }}>
        Your daily companion for reflection, gratitude, and personal growth.
      </p>

      <Link
        href="/today"
        style={{
          backgroundColor: 'var(--primary)',
          color: 'white',
          padding: '1rem 2.5rem',
          borderRadius: '50px',
          fontSize: '1.125rem',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(74, 124, 89, 0.3)',
          transition: 'transform 0.2s ease',
        }}
      >
        Start Journaling
      </Link>
    </div>
  );
}
