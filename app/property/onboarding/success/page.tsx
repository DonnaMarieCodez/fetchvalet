export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-white text-black rounded-xl p-8 shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Property Created 🎉</h1>
        <p className="mb-6">Your property has been successfully onboarded.</p>
        <a
          href="/admin/properties"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Go to Properties
        </a>
      </div>
    </div>
  );
}