import { useEffect, useRef, useState } from "react";
import { CATEGORY_GROUPS } from "../../constants";
import { searchUnsplashPhotos } from "../../services/unsplash";
import css from "./Portfolio.module.css";

const KEYWORDS = {
    rings: "jewelry ring",
    earrings: "jewelry earrings",
    pendants: "jewelry necklace pendant",
    chains: "jewelry chain",
    bracelets: "jewelry bracelet",
};

const PER_PAGE = 9;

const Portfolio = () => {
    const [activeCategory, setActiveCategory] = useState(CATEGORY_GROUPS[0].id);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorText, setErrorText] = useState("");

    // простий кеш, щоб при поверненні в категорію не робити зайвий запит
    const cacheRef = useRef(new Map());

    useEffect(() => {
        const controller = new AbortController();

        async function load() {
        setErrorText("");
        setLoading(true);

        const cached = cacheRef.current.get(activeCategory);
        if (cached) {
            setImages(cached);
            setLoading(false);
            return;
        }

        const keyword = KEYWORDS[activeCategory] || "jewelry";
        const randomPage = Math.floor(Math.random() * 10) + 1; // щоб частіше були різні фото

        try {
            const photos = await searchUnsplashPhotos(keyword, {
            page: randomPage,
            perPage: PER_PAGE,
            signal: controller.signal,
            });

            setImages(photos);
            cacheRef.current.set(activeCategory, photos);
        } catch (e) {
            if (e?.name !== "AbortError") {
            setErrorText("Не вдалося завантажити фото з Unsplash. Спробуйте ще раз.");
            console.error(e);
            }
        } finally {
            setLoading(false);
        }
        }

        load();
        return () => controller.abort();
    }, [activeCategory]);

    return (
        <div className={css.portfolioPage}>
        <div className={css.portfolioHeader}>
            <h1 className={css.portfolioTitle}>Наше Портфоліо</h1>
            <p className={css.portfolioSubtitle}>
            Ми пишаємося кожним виробом. Оберіть категорію, щоб побачити наші роботи.
            </p>
        </div>

        {/* === БЛОК 1: КНОПКИ КАТЕГОРІЙ === */}
        <div className={css.categoriesGrid}>
            {CATEGORY_GROUPS.map((cat) => {
            const isActive = activeCategory === cat.id;
            const parts = cat.label.split(" ");
            const text = parts.slice(1).join(" ");

            return (
                <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`${css.categoryButton} ${isActive ? css.categoryButtonActive : ""}`}
                type="button"
                >
                <div className={css.categoryText}>{text}</div>
                </button>
            );
            })}
        </div>

        <hr className={css.divider} />

        {/* === БЛОК 2: ГАЛЕРЕЯ ФОТО === */}
        <div className={css.galleryWrap}>
            {loading ? (
            <div className={css.loading}>Завантаження мистецтва... </div>
            ) : errorText ? (
            <div className={css.errorBox}>{errorText}</div>
            ) : (
            <div className={css.imagesGrid}>
                {images.map((img, index) => (
                <div key={img.id} className={`${css.imageCard} portfolio-item`}>
                    <img className={css.image} src={img.src} alt={img.alt} loading="lazy" />

                    {/* Ховер оверлей */}
                    <div className={css.overlay}>
                    <span>Артикул #{2025 + index}</span>

                    {/* (Рекомендовано Unsplash) — атрибуція в оверлеї, щоб не ламати верстку */}
                    {img.photographerUrl && (
                        <a
                        className={css.creditLink}
                        href={img.photographerUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        >
                        Фото: {img.photographerName}
                        </a>
                    )}
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
        </div>
    );
}

export default Portfolio;