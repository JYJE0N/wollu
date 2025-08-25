import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          404 - 페이지를 찾을 수 없습니다
        </h1>
        <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          요청하신 페이지가 존재하지 않습니다.
        </p>
        <Link 
          href="/"
          className="px-4 py-2 rounded-lg font-medium transition-colors inline-block"
          style={{
            backgroundColor: 'var(--color-interactive-primary)',
            color: 'white'
          }}
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}