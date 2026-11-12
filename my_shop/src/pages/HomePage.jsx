export default function HomePage() {
    return (
        <main className="container container-narrow">
            <section className="hero">
                <h1>Wellcome to my website</h1>
                <p>من در حال یادگیری برنامه‌نویسی وب هستم.</p>
            </section>

            <section className="card">
                <h2>مهارت‌های من</h2>
                <ul className="skills">
                    <li>HTML</li>
                    <li>CSS</li>
                    <li>JavaScript</li>
                    <li>React js</li>
                </ul>
            </section>

            <section className="card">
                <h2>هدف من</h2>
                <p>
                    من به مبانی برنامه نویسی به زبان جاوا اسکریپت بسیار علاقه دارم
                    و از طرفی هم شرایط تحصیلی من اجازه‌ی کار به صورت دائم در سازمانی رو نمی‌ده
                    و من هم به سبک زندگی فریلنسرها بسیار علاقه دارم و می‌خوام که بدون
                    وابستگی به مکان بتونم درآمدزایی کنم.
                </p>
            </section>

            <p className="cta">
                <a href="https://developer.mozilla.org/" target="_blank" rel="noopener noreferrer">
                    یادگیری بیشتر درباره وب
                </a>
            </p>
        </main>
    );
}