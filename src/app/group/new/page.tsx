import { CreateGroupForm, PreviewModal } from "./components";

export default function NewGroupPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex flex-col p-6 md:p-10">
        <CreateGroupForm />
      </div>

      {/* Right Side - Preview with Gradient Background */}
      <div className="relative hidden lg:flex bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 overflow-hidden items-center justify-center p-6">
        {/* Overlay Pattern */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl" />
            <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute top-1/2 right-1/2 w-24 h-24 bg-white/15 rounded-full blur-lg" />
          </div>
        </div>

        {/* Preview Content */}
        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Preview Your Group
            </h2>
            <p className="text-blue-100">
              See how your trip will look to friends
            </p>
          </div>
          <PreviewModal />
        </div>
      </div>
    </div>
  );
}
