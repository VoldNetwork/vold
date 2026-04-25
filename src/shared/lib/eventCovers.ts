/**
 * Curated cover-image presets for the event creation flow.
 *
 * 24 hand-picked Unsplash photos across 5 themes. The picker writes
 * `fullUrl` into `events.image_url`, which DiscoverPage renders directly.
 *
 * To swap an image: open https://unsplash.com, find a photo, the ID is the
 * trailing slug in the URL (e.g. `/photos/photo-1517649763962-0c623066013b`).
 * Replace the photo ID below — the resize query string handles the rest.
 */

export type EventCoverTheme =
  | 'sport'
  | 'volunteering'
  | 'nature'
  | 'teaching'
  | 'disaster-relief'

export interface EventCover {
  id: string
  theme: EventCoverTheme
  thumbUrl: string
  fullUrl: string
  alt: string
}

export const EVENT_COVER_THEMES: { value: EventCoverTheme; label: string }[] = [
  { value: 'sport', label: 'Sport' },
  { value: 'volunteering', label: 'Volunteering' },
  { value: 'nature', label: 'Nature' },
  { value: 'teaching', label: 'Teaching' },
  { value: 'disaster-relief', label: 'Disaster Relief' },
]

const FULL = 'w=1200&h=800&fit=crop&auto=format&q=70'
const THUMB = 'w=480&h=320&fit=crop&auto=format&q=60'

const cover = (
  id: string,
  theme: EventCoverTheme,
  photoId: string,
  alt: string,
): EventCover => ({
  id,
  theme,
  thumbUrl: `https://images.unsplash.com/photo-${photoId}?${THUMB}`,
  fullUrl: `https://images.unsplash.com/photo-${photoId}?${FULL}`,
  alt,
})

export const EVENT_COVERS: EventCover[] = [
  cover('sport-01', 'sport', '1517649763962-0c623066013b', 'Runners on a track'),
  cover('sport-02', 'sport', '1530549387789-4c1017266635', 'Basketball game in motion'),
  cover('sport-03', 'sport', '1546519638-68e109498ffc', 'Weights in a gym'),
  cover('sport-04', 'sport', '1571019613454-1cb2f99b2d8b', 'Athlete training'),
  cover('sport-05', 'sport', '1593341646782-e0b495cff86d', 'Yoga class outdoors'),

  cover('volunteering-01', 'volunteering', '1593113598332-cd288d649433', 'Volunteers stacking hands'),
  cover('volunteering-02', 'volunteering', '1488521787991-ed7bbaae773c', 'Helping hand reaching out'),
  cover('volunteering-03', 'volunteering', '1469571486292-0ba58a3f068b', 'Community gathering'),
  cover('volunteering-04', 'volunteering', '1559027615-cd4628902d4a', 'Volunteer group photo'),
  cover('volunteering-05', 'volunteering', '1532629345422-7515f3d16bb6', 'Volunteers sorting donations'),

  cover('nature-01', 'nature', '1441974231531-c6227db76b6e', 'Sunlit forest path'),
  cover('nature-02', 'nature', '1469474968028-56623f02e42e', 'Mountain ridge at dawn'),
  cover('nature-03', 'nature', '1501785888041-af3ef285b470', 'Green hills under cloud'),
  cover('nature-04', 'nature', '1426604966848-d7adac402bff', 'Wide mountain landscape'),
  cover('nature-05', 'nature', '1518495973542-4542c06a5843', 'Sunbeams through trees'),

  cover('teaching-01', 'teaching', '1577896851231-70ef18881754', 'Children in a classroom'),
  cover('teaching-02', 'teaching', '1503676260728-1c00da094a0b', 'Teacher with students'),
  cover('teaching-03', 'teaching', '1427504494785-3a9ca7044f45', 'Kids learning together'),
  cover('teaching-04', 'teaching', '1497486751825-1233686f5d54', 'Open book on a desk'),

  cover('relief-01', 'disaster-relief', '1542385151-efd9000785a0', 'Emergency response vehicle'),
  cover('relief-02', 'disaster-relief', '1587653263995-422546a7a569', 'Aid workers in the field'),
  cover('relief-03', 'disaster-relief', '1581094794329-c8112a89af12', 'Medical supplies being packed'),
  cover('relief-04', 'disaster-relief', '1541199249251-f713e6145474', 'First-aid kit and gear'),
  cover('relief-05', 'disaster-relief', '1590487988256-9ed24133863e', 'Relief goods being distributed'),
]
