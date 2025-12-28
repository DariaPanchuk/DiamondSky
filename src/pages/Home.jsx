import Hero from '../components/Hero/Hero';
import WhyUs from '../components/WhyUs/WhyUs';
import PhilosophySection from '../components/Philosophy/PhilosophySection';

const Home = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Hero />
            <WhyUs />
            <PhilosophySection />
        
        </div>
    );
};

export default Home;