import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const PrivacyPolicy: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-y-auto overflow-x-hidden w-full relative max-w-full">
            <div className="max-w-3xl mx-auto p-6 md:p-12 pt-20 md:pt-24 pb-32 md:pb-12">

                <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-gray-100">{t('privacy.title') || 'Privacy Policy'}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last Updated: January 20, 2026</p>

                <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">1. Introduction</h2>
                        <p>Welcome to কই যাবো (Koy Jabo). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we handle your information when you use our bus route finder application for traveling across Bangladesh.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">2. Data We Do Not Collect</h2>
                        <p>Koy Jabo is designed with privacy in mind. We do NOT collect, store, or transmit:</p>
                        <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
                            <li>Personal identification information (name, email, phone number)</li>
                            <li>Your location data to any server</li>
                            <li>Your search history or route preferences</li>
                            <li>Any browsing behavior or analytics linked to your identity</li>
                            <li>Device information or IP addresses for tracking purposes</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">3. Local Data Processing</h2>
                        <p><strong>Location Services:</strong> When you grant location permission, your GPS coordinates are processed entirely on your device to:</p>
                        <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
                            <li>Show your position on the route map</li>
                            <li>Find the nearest bus stop to your current location</li>
                            <li>Calculate distances to stations</li>
                        </ul>
                        <p className="mt-3">This data never leaves your device and is not stored permanently.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">4. Local Storage</h2>
                        <p>We use your browser's local storage technology to improve your experience by saving:</p>
                        <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
                            <li><strong>Favorite buses:</strong> Your saved bus routes (stored locally on your device)</li>
                            <li><strong>Search History:</strong> Your recent searches and route preferences (stored locally)</li>
                            <li><strong>Theme Preference:</strong> Your choice of Dark or Light mode</li>
                            <li><strong>Language Preference:</strong> Your choice of Bengali or English</li>
                        </ul>
                        <p className="mt-3">You can clear this data anytime through your browser settings or the app's settings page (if available).</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">5. Third-Party Services & AdSense</h2>
                        <p><strong>Google AdSense:</strong> We use Google AdSense to display advertisements. Google uses cookies to serve ads based on your prior visits to our website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our sites and/or other sites on the Internet.</p>
                        <p className="mt-2">You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Ads Settings</a>.</p>

                        <p className="mt-3"><strong>Koy Jabo AI Assistant:</strong> Our built-in AI assistant processes your route queries to provide intelligent recommendations. Your questions are handled securely and are not stored permanently or shared with third parties.</p>
                        <p className="mt-3"><strong>Google Maps:</strong> When you click "Real Map" to view routes in Google Maps, you'll be redirected to Google Maps. Google's privacy policy applies to that service.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">6. Cookies Policy</h2>
                        <p>Koy Jabo itself does not use cookies for tracking. However, third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">7. Children's Privacy</h2>
                        <p>Our service is available to users of all ages. Since we don't collect any personal data, there are no special considerations for children's privacy. We encourage parents to guide their children's use of internet services.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">8. Changes to Policy</h2>
                        <p>We may update this privacy policy from time to time. Any changes will be posted on this page with an updated "Last updated" date using the current year (2026).</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">9. Contact Us</h2>
                        <p>If you have any questions about this privacy policy, please contact us through our <a href="https://linkedin.com/in/mejbaur/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">LinkedIn profile</a>.</p>
                    </section>

                    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4 mt-8">
                        <p className="text-sm font-bold text-green-800 dark:text-green-300">✓ Privacy-First Design</p>
                        <p className="text-sm text-green-700 dark:text-green-400 mt-1">Koy Jabo is built with your privacy as a top priority. All data processing happens on your device, and nothing is sent to our servers.</p>
                    </div>
                </div>

                {/* Bottom padding for better scrolling */}
                <div className="h-20"></div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
