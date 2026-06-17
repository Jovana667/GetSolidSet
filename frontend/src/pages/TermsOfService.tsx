import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <Navbar />
          <div className="max-w-3xl mx-auto px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Terms of Service
            </h1>
            <p className="text-gray-500 mb-10 text-sm">
              Last updated: April 2026
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  By creating an account and using Macrology you agree to these
                  Terms of Service. If you do not agree, please do not use the
                  application.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  2. Description of Service
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Macrology is a nutrition tracking application that allows
                  users to log meals, track macronutrients and manage food data.
                  The service is currently in pilot phase.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  3. User Accounts
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>You must provide a valid email address to register.</li>
                  <li>
                    You are responsible for maintaining the security of your
                    account and password.
                  </li>
                  <li>You must not share your account with others.</li>
                  <li>
                    You must be at least 13 years of age to use Macrology.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  4. Acceptable Use
                </h2>
                <p className="text-gray-700 mb-3">You agree not to:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Use Macrology for any unlawful purpose.</li>
                  <li>
                    Attempt to gain unauthorised access to any part of the
                    service.
                  </li>
                  <li>
                    Upload malicious code or attempt to interfere with the
                    service.
                  </li>
                  <li>Misrepresent your identity or affiliation.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  5. Nutritional Disclaimer
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Macrology provides nutritional information for general
                  tracking purposes only. This information is approximate and
                  should not be used as a substitute for professional dietary or
                  medical advice. Always consult a qualified healthcare
                  professional before making significant changes to your diet.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  6. Intellectual Property
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  All content, design and code within Macrology is the property
                  of Macrology. You may not copy, reproduce or distribute any
                  part of the service without written permission.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  7. User Content
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  You retain ownership of the meal plans and food data you
                  create in Macrology. By using the service you grant us a
                  limited licence to store and display your content solely for
                  the purpose of providing the service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  8. Termination
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to suspend or terminate your account if
                  you violate these Terms of Service. You may delete your
                  account at any time by contacting us.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  9. Limitation of Liability
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Macrology is provided "as is" without warranties of any kind.
                  We are not liable for any loss or damage arising from your use
                  of the service, including but not limited to data loss or
                  inaccurate nutritional information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  10. Changes to Terms
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update these Terms of Service from time to time.
                  Continued use of Macrology after changes constitutes
                  acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  11. Governing Law
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  These terms are governed by the laws of New South Wales,
                  Australia.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  12. Contact
                </h2>
                <p className="text-gray-700 mb-2">
                  For any questions regarding these terms, contact us at:
                </p>
                <p className="text-gray-700">📧 [your email here]</p>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default TermsOfService;
