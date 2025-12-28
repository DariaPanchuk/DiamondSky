import css from './Hero.module.css';

const Hero = () => {
    return (
        <section className={css.hero}>
            <h1 className={css.title}>Ювелірні вироби ручної роботи на замовлення</h1>
            <p className={css.subtitle}>Створюємо унікальні прикраси</p>
        </section>
    );
}

export default Hero;