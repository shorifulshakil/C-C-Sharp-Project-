export default function AboutPage() {
  const team = [
    { name: 'Sarah Johnson', role: 'CEO & Founder', avatar: '👩‍💼' },
    { name: 'Michael Chen', role: 'CTO', avatar: '👨‍💻' },
    { name: 'Emily Davis', role: 'Head of Operations', avatar: '👩‍🔧' },
    { name: 'James Wilson', role: 'Lead Designer', avatar: '👨‍🎨' },
  ];

  const values = [
    { icon: '🎯', title: 'Quality First', desc: 'We vet every dealer to ensure products meet our high standards.' },
    { icon: '🤝', title: 'Community Driven', desc: 'Supporting small businesses and independent creators worldwide.' },
    { icon: '💡', title: 'Innovation', desc: 'Continuously improving our platform for better user experience.' },
    { icon: '🌍', title: 'Global Reach', desc: 'Connecting buyers and sellers across the globe.' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">About ShopHub</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            We&apos;re building the future of multi-vendor e-commerce, connecting amazing dealers with passionate customers.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 font-heading mb-4">Our Story</h2>
              <p className="text-neutral-600 mb-4">
                ShopHub was born from a simple idea: create a platform where independent dealers can reach customers worldwide, while giving buyers access to unique, high-quality products they won&apos;t find anywhere else.
              </p>
              <p className="text-neutral-600 mb-4">
                We believe that small businesses are the backbone of the economy. Our mission is to provide them with the tools and platform they need to compete with larger retailers, while maintaining the personal touch and quality that makes them special.
              </p>
              <p className="text-neutral-600">
                Every product on ShopHub goes through our rigorous approval process, ensuring that only the best items make it to our customers. This commitment to quality has helped us build a trusted community of dealers and buyers.
              </p>
            </div>
            <div className="bg-neutral-100 rounded-2xl p-8 text-center">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-4xl font-bold text-primary-600">500+</p>
                  <p className="text-sm text-neutral-600">Products</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary-600">50+</p>
                  <p className="text-sm text-neutral-600">Dealers</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary-600">10K+</p>
                  <p className="text-sm text-neutral-600">Customers</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary-600">98%</p>
                  <p className="text-sm text-neutral-600">Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-neutral-900 text-center font-heading mb-12">Our Values</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-xl p-6 text-center shadow-sm border border-neutral-200">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-semibold text-neutral-900 mb-2">{v.title}</h3>
                <p className="text-sm text-neutral-600">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-neutral-900 text-center font-heading mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {team.map((t) => (
              <div key={t.name} className="text-center">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                  {t.avatar}
                </div>
                <h3 className="font-semibold text-neutral-900">{t.name}</h3>
                <p className="text-sm text-neutral-500">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4 font-heading">Join Our Community</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Whether you&apos;re a dealer looking to expand your reach or a customer seeking unique products, ShopHub is the place for you.
          </p>
          <div className="flex justify-center gap-4">
            <a href="/auth/register" className="px-6 py-3 bg-white text-primary-700 rounded-lg font-medium hover:bg-neutral-100 transition-colors">
              Get Started
            </a>
            <a href="/contact" className="px-6 py-3 border border-white/30 text-white rounded-lg font-medium hover:bg-white/10 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
