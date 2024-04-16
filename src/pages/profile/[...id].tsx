import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useRef, useState } from 'react';

import CustomButton from '@/components/button/CustomButton';
import SortButton from '@/components/button/SortButton';
import ProfileCard from '@/components/card/ProfileCard';
import UniversalCard from '@/components/card/UniversalCard';
import ProfileCategory from '@/components/profile/ProfileCategory';
import SkeletonProfile from '@/components/skeleton/SkeletonProfile';
import SkeletonUniversalCard from '@/components/skeleton/SkeletonUniversalCard';
import useMemberProfileGet from '@/hooks/profile/useMemberProfileGet';
import useMyContent from '@/hooks/profile/useMyContent';
import { IUniversalType } from '@/types/global';

const POSTTYPEOTIONS = [
  { type: 'project', name: '프로젝트' },
  { type: 'recruit', name: '모집' },
  { type: 'community', name: '커뮤니티' },
];

const SORTTPYEOPTIONS = [
  { type: 'desc', name: '최신순' },
  { type: 'asc', name: '오래된 순' },
];

const CATEGORIES = [
  {
    name: '내 게시물',
    type: 'project',
  },
  {
    name: '받은 피드백',
    type: 'feedback',
  },
  {
    name: '내 댓글',
    type: 'comment',
  },
  {
    name: '북마크',
    type: 'bookmark',
  },
];

export default function Profile() {
  const [postType, setPostType] = useState({
    type: 'project',
    name: '프로젝트',
  });
  const [sortType, setSortType] = useState({
    type: 'desc',
    name: '최신순',
  });
  const [category, setCategory] = useState({
    type: 'project',
    name: '내 게시물',
  });

  const router = useRouter();
  const memberId = router.query.id;

  const { isLoading: profileLoading, data: profile } = useMemberProfileGet(
    memberId as string
  );

  const {
    isLoading: contentsLoading,
    data: contents,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMyContent(
    memberId as string,
    3,
    postType.type,
    sortType.type,
    category.type
  );

  const observer: React.MutableRefObject<IntersectionObserver | null> =
    useRef(null);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !isError) {
            fetchNextPage();
          }
        },

        { threshold: 0.7 }
      );
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage]
  );

  return (
    <main className="relative flow-root">
      {profileLoading ? (
        <SkeletonProfile />
      ) : (
        <section className="max-w-screen-md m-auto my-[100px]">
          <h1 className="sr-only">내 프로필</h1>
          <Link href={`/profile/editer`} className="flex justify-end mt-10">
            <CustomButton className="px-2 py-1">수정</CustomButton>
          </Link>
          <ProfileCard items={profile} />
        </section>
      )}
      <ProfileCategory
        category={CATEGORIES}
        setSelectedTab={setCategory}
        selectedTab={category}
      />
      <section className="pt-10 pb-24 max-w-4xl m-auto relative">
        <div>
          <SortButton
            select={sortType}
            setSelect={setSortType}
            options={SORTTPYEOPTIONS}
            className="right-[6.25rem]"
          />
          <SortButton
            select={postType}
            setSelect={setPostType}
            options={POSTTYPEOTIONS}
            className="right-0"
          />
        </div>
        <div className="mt-7 flex flex-col justify-center">
          {contentsLoading ? (
            [1, 2, 3].map((item, index) => (
              <SkeletonUniversalCard key={`${item}-${index}`} size="large" />
            ))
          ) : (
            <>
              {contents?.pages.map((item, index) =>
                item?.map((item: IUniversalType) => (
                  <UniversalCard
                    key={`myContent-list-${item.id}`}
                    id={item.id}
                    postType={postType.type}
                    title={item.title ? item.title : item.contentsTitle}
                    content={
                      item.bannerContent ? item.bannerContent : item.content
                    }
                    image={item.thumbnail ? item.thumbnail : ''}
                    size="large"
                    className="my-2 w-full"
                  />
                ))
              )}
            </>
          )}
          {isFetchingNextPage ? (
            [1, 2, 3].map((item, index) => (
              <SkeletonUniversalCard key={`${item}-${index}`} size="large" />
            ))
          ) : (
            <div ref={lastElementRef}></div>
          )}
        </div>
      </section>
    </main>
  );
}
