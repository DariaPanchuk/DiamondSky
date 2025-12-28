import css from './AboutUs.module.css';

const AboutUs = () => {
    return (
        <section className={css.section}>
            <div className={css.titleContainer}>
                <h1 className={css.title}>Про Нас</h1>
            </div>
            <div className={css.whyUsContainer}>
                <ul className={css.list}>
                    <li className={css.listItem}>
                    <h3 className={css.itemTitle}>Хто ми?</h3>  
                    <p className={css.itemText}>
                        Ювелірна майстерня "DiamondSky" — це місце, де дорогоцінні метали та камені перетворюються на витвори мистецтва. 
                        Ми працюємо на ринку вже понад 10 років, поєднуючи класичні традиції ювелірної справи з сучасними 3D-технологіями.
                    </p>
                    </li>
                    <li className={css.listItem}>
                    <h3 className={css.itemTitle}>Наша місія</h3>
                    <p className={css.itemText}>
                        Наша місія — створювати ювелірні витвори, які вражають своєю елегантністю та унікальністю. 
                        Ми прагнемо до того, щоб кожна прикраса була не просто прикрасою, а справжнім шедевром, 
                        який викликає емоції та залишається в пам'яті. Передається з покоління в покоління.
                    </p>
                    </li>
                </ul>
                <p className={css.conclusion}>
                    Обираючи "DiamondSky", ви обираєте якість, інновації та неповторний стиль. 
                    Дозвольте нам створити для вас прикрасу, яка відображає вашу індивідуальність та красу.
                </p>
            </div>
        </section>
    );
};

export default AboutUs;