import philosophyImg from "../../images/philosophy.jpg";
import css from './PhilosophySection.module.css';

const PhilosophySection = () => {
    return (
        <section className={css.section}>
            <h2 className={css.title}>Філософія Бренду</h2>
            <div className={css.philosophyContent}>
                <div className={css.philosophyText}>
                        <p>
                            Для нас прикраса — це не просто метал і каміння. Це історія. 
                            Історія вашого кохання, вашого успіху, вашої пам'яті.
                        </p>
                        <p>
                            Ми віримо, що справжня розкіш — це не ціна, а сенс, який ви вкладаєте у виріб. 
                            Саме тому ми не просто продаємо каблучки, ми допомагаємо вам закарбувати момент у вічності.
                        </p>
                        <blockquote className={css.philosophyQuote}>
                            "Коштовності мають значення лише тоді, коли вони дарують емоції."
                        </blockquote>
                        <p>
                            Наш бренд створений для тих, хто цінує не лише красу, а й глибину почуттів. 
                            Ми прагнемо бути частиною ваших найважливіших моментів, надаючи прикрасам душу і значення.
                        </p>
                    </div>
                <div>
                    <img
                        src={philosophyImg}
                        alt="Jewelry Philosophy"
                        className={css.philosophyImage}
                    />
                </div>
            </div>
        </section>
    );
};

export default PhilosophySection;