import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <Navbar />
          <div className="max-w-3xl mx-auto px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Privacy Policy
            </h1>
            <p className="text-gray-500 mb-10 text-sm">
              Last updated: July 2026
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  1. Introduction
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Get Solid Set ("we", "us", "our") is committed to protecting
                  your personal information. This Privacy Policy explains how
                  we collect, use and store your data when you use our
                  application.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  2. What We Collect
                </h2>
                <p className="text-gray-700 mb-3">
                  When you use Get Solid Set we collect:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li>
                    Your email address and password (encrypted) when you
                    register.
                  </li>
                  <li>Meal plans and food logging data you create.</li>
                  <li>Custom food items you add to your account.</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  We do not collect payment information, location data or any
                  sensitive personal information beyond what is listed above.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  3. How We Use Your Data
                </h2>
                <p className="text-gray-700 mb-3">
                  We use your data solely to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li>Provide and operate the Get Solid Set service.</li>
                  <li>Allow you to log in and access your meal plans.</li>
                  <li>
                    Store your nutrition tracking data so you can access it
                    across sessions.
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  We do not sell, share or disclose your data to third parties
                  for any purpose.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  4. How We Store Your Data
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Your data is stored securely in an encrypted database.
                  Passwords are hashed and never stored in plain text. We take
                  reasonable measures to protect your information from
                  unauthorised access.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  5. Your Rights
                </h2>
                <p className="text-gray-700 mb-3">You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li>Access the personal data we hold about you.</li>
                  <li>Request correction of inaccurate data.</li>
                  <li>
                    Request deletion of your account and all associated data.
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  To exercise any of these rights, contact us at the email
                  below.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  6. Data Retention
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We retain your data for as long as your account is active. If
                  you request account deletion, all your personal data and meal
                  records will be permanently removed within 30 days.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  7. Third Party Services
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Get Solid Set does not currently use third party analytics,
                  advertising or tracking services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  8. Children's Privacy
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Get Solid Set is not intended for users under the age of 13.
                  We do not knowingly collect data from children.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  9. Changes to This Policy
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will
                  notify you of any significant changes via email or an in-app
                  notice.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  10. Contact Us
                </h2>
                <p className="text-gray-700 mb-2">
                  If you have any questions about this Privacy Policy or your
                  data, please contact us at:
                </p>
                <p className="text-gray-700">📧 getsolidset@gmail.com</p>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PrivacyPolicy;