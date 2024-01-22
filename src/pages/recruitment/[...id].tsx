import Banner from '@/components/banner/Banner';
import Category from '@/components/Category';

export default function RecruitmentDetail() {
  const category = [
    { name: 'Android', link: 'android' },
    { name: 'Ios', link: 'ios' },
    { name: 'Web', link: 'web' },
  ];

  return (
    <div>
      <Banner />
      <Category category={category} btnValue="프로젝트 올리기" />
    </div>
  );
}
