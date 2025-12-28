import css from './Contacts.module.css';

const Contacts = () => {
    return (
        <section className={css.section}>
            <div className={css.container}>
                <div className={css.titleContainer}>
                    <h1 className={css.title}>Контакти</h1>
                </div>
                <div className={css.contactsContainer}>
                    <ul className={css.list}>
                        <li className={css.listItem}>
                            <h3 className={css.itemTitle}>Адреса</h3>  
                            <p className={css.itemText}>
                                вул. Володимира Великого, 15, Київ, Україна
                            </p>
                        </li>
                        <li className={css.listItem}>
                            <h3 className={css.itemTitle}>Телефон</h3>
                            <p className={css.itemText}>
                                +38 (044) 123-45-67
                            </p>
                        </li>
                        <li className={css.listItem}>
                            <h3 className={css.itemTitle}>Email</h3>
                            <p className={css.itemText}>
                                info@diamondsky.ua
                            </p> 
                        </li>
                        <li className={css.listItem}>
                            <h3 className={css.itemTitle}>Години роботи</h3>
                            <p className={css.itemText}>
                                Пн-Пт: 10:00 - 19:00, Сб-Нд: 11:00 - 17:00
                            </p>
                        </li>
                    </ul>
                    </div>
                </div>
        </section>
    );
}

export default Contacts;