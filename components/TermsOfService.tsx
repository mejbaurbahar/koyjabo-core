import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const TermsOfService: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-y-auto overflow-x-hidden w-full relative max-w-full">
            <div className="max-w-3xl mx-auto p-6 md:p-12 pt-20 md:pt-24 pb-32 md:pb-12">
                <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-gray-100">{t('terms.title') || 'Terms of Service'}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last Updated: January 20, 2026</p>

                <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">1. Acceptance of Terms</h2>
                        <p>By accessing and using কই যাবো (Koy Jabo), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">2. Service Description</h2>
                        <p>Koy Jabo is a free, web-based application that provides:</p>
                        <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
                            <li>Bus route information across Bangladesh (inter-district, inter-city, local, and highway routes)</li>
                            <li>Metro rail, train, and launch station information (where available)</li>
                            <li>Fare estimation based on official rates</li>
                            <li>Route visualization and mapping</li>
                            <li>AI-powered route assistance</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">3. No Warranty</h2>
                        <p>Koy Jabo is provided "AS IS" and "AS AVAILABLE" without any warranties of any kind, either express or implied, including but not limited to:</p>
                        <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
                            <li>Accuracy of bus routes, schedules, or fare information</li>
                            <li>Availability or reliability of the service</li>
                            <li>Fitness for a particular purpose</li>
                            <li>Non-infringement of third-party rights</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">4. Data Accuracy</h2>
                        <p><strong>Important Notice:</strong> Bus routes, stops, timings, and fares are subject to change by transport authorities without notice. We make reasonable efforts to keep information current, but:</p>
                        <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
                            <li>Routes may be modified or discontinued by operators</li>
                            <li>Fares may change based on government regulations</li>
                            <li>Bus schedules may vary due to traffic, weather, or other factors</li>
                            <li>Station locations and names may be updated</li>
                        </ul>
                        <p className="mt-3">Always verify critical information with official sources or bus operators before traveling.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">5. Limitation of Liability</h2>
                        <p>To the maximum extent permitted by law, Koy Jabo and its developers shall not be liable for:</p>
                        <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
                            <li>Any direct, indirect, incidental, or consequential damages</li>
                            <li>Loss of time, money, or opportunities due to inaccurate information</li>
                            <li>Missed buses, wrong routes, or incorrect fare calculations</li>
                            <li>Any damages arising from the use or inability to use the service</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">6. User Responsibilities</h2>
                        <p>When using Koy Jabo, you agree to:</p>
                        <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
                            <li>Use the service for lawful purposes only</li>
                            <li>Not attempt to reverse engineer or modify the application</li>
                            <li>Not use automated systems to scrape or download data</li>
                            <li>Verify important information with official sources</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">7. Third-Party Services</h2>
                        <p><strong>Koy Jabo AI Assistant:</strong> Our AI assistant is provided as-is to help you navigate Bangladesh more easily. It is completely free and available to all users.</p>
                        <p className="mt-2"><strong>Google Maps:</strong> Links to Google Maps are provided for convenience and are subject to Google's terms of service.</p>
                        <p className="mt-2">We are not responsible for the availability, accuracy, or terms of these third-party services.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">8. Intellectual Property</h2>
                        <p>The Koy Jabo application, including its design, code, and content, is the property of its developers. Bus route data is compiled from publicly available sources and transport authority information.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">9. Service Modifications</h2>
                        <p>We reserve the right to:</p>
                        <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
                            <li>Modify or discontinue the service at any time</li>
                            <li>Update features, routes, or information</li>
                            <li>Change these terms of service</li>
                        </ul>
                        <p className="mt-3">Continued use of the service after changes constitutes acceptance of the new terms.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">10. Governing Law</h2>
                        <p>These terms shall be governed by and construed in accordance with the laws of Bangladesh, without regard to its conflict of law provisions.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">11. Contact Us</h2>
                        <p>For questions about these terms, please contact us through our <a href="https://linkedin.com/in/mejbaur/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">LinkedIn profile</a>.</p>
                    </section>

                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mt-8">
                        <p className="text-sm font-bold text-blue-800 dark:text-blue-300">📱 Free & Open Service</p>
                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">Koy Jabo is provided as a free public service to help Dhaka commuters navigate the city. Use it as a helpful guide, but always exercise your own judgment when traveling.</p>
                    </div>
                </div>

                {/* Bottom padding for better scrolling */}
                <div className="h-20"></div>
            </div>
        </div>
    );
};

export default TermsOfService;
