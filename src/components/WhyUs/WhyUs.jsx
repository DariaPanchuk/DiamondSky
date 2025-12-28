import css from './WhyUs.module.css';

const WhyUs = () => {
    return (
        <section className={css.whyUsSection}>  
            <h2 className={css.title}>Чому обирають нас?</h2>
            <div>
                <ul className={css.reasonsContainer}>
                    <li className={css.reasonItem}>Власне виробництво</li>
                    <li className={css.reasonItem}>Багаторічний досвід у ювелірній справі</li>
                    <li className={css.reasonItem}>Висока якість матеріалів та виготовлення</li>
                    <li className={css.reasonItem}>Індивідуальний підхід до кожного клієнта</li>
                    <li className={css.reasonItem}>Професійна команда ювелірів</li>
                    <li className={css.reasonItem}>Гарантія задоволення від наших виробів</li>
                    <li className={css.reasonItem}>Сертифікати на діаманти</li>
                    <li className={css.reasonItem}>Проба на ювелірних виробах</li>
                </ul>
            </div>
        </section>
    );
}

export default WhyUs;