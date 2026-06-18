export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-4 p-8">
        <h1 className="text-2xl font-semibold text-center">Enterprise API Gateway</h1>
        <p className="text-sm text-muted-foreground text-center">Sign in to your account</p>
        <form className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input type="email" className="w-full border rounded-md px-3 py-2 text-sm" placeholder="admin@example.com" />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input type="password" className="w-full border rounded-md px-3 py-2 text-sm" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium">
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
