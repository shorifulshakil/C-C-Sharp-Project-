export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-neutral-900 mb-2">404</h2>
        <p className="text-neutral-600 mb-4">Page not found</p>
        <a href="/" className="btn btn-primary btn-md">
          Go home
        </a>
      </div>
    </div>
  );
}
