import BestSeller from '../Components/BestSeller';
import Hero from '../Components/Hero';
import LatestCollection from '../Components/LatestCollection';
import NewsLetterBox from '../Components/NewsLetterBox';
import OurPolicies from '../Components/OurPolicies';
import Recommendations from '../Components/Recommendations';

const Home = () => {
  return (
    <div>
      <Hero />
      <LatestCollection />
      <BestSeller />
      <Recommendations />
      <OurPolicies />
      <NewsLetterBox />
    </div>
  );
};

export default Home;
