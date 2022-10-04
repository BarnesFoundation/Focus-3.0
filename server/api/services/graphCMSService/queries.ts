import { GraphQLQuery } from "./types";

// Fragment definition for fields to pull from story
const storiesFragment = `on Stories {
	id
	storyTitle
	alternativeHeroImageObjectID
	objectID1
	shortParagraph1 {
	  html
	}
	longParagraph1 {
	  html
	}
	objectID2
	shortParagraph2 {
	  html
	}
	longParagraph2 {
	  html
	}
	objectID3
	shortParagraph3 {
	  html
	}
	longParagraph3 {
	  html
	}
	objectID4
	shortParagraph4 {
	  html
	}
	longParagraph4 {
	  html
	}
	objectID5
	shortParagraph5 {
	  html
	}
	longParagraph5 {
	  html
	}
	objectID6
	shortParagraph6 {
	  html
	}
	longParagraph6 {
	  html
	}
}
`;

export function storiesForObjectIdQuery(objectId: string): GraphQLQuery {
  return {
    query: `
		query($objectID: Int) {
			storiesForObjectIds(where: { objectID: $objectID }) {
			  id
			  objectID
			  relatedStories {
				id
			  }
			}
		  }
		  `,
    variables: {
      objectID: parseInt(objectId),
    },
  };
}

export function storiesForObjectIdsQuery(objectIds: string[]): GraphQLQuery {
  return {
    query: `
		  query($objectID: Int) {
			  storiesForObjectIds(where: { objectID_in: [$objectIDs] }) {
				id
				objectID
				relatedStories {
				  id
				}
			  }
			}
			`,
    variables: {
      objectIDs: objectIds.map((objectId) => parseInt(objectId)),
    },
  };
}

export function relatedStoriesByObjectIdQuery(objectId: string): GraphQLQuery {
  return {
    query: `query($objectID: Int) {
        storiesForObjectIds(where: { objectID: $objectID }) {
          id
          objectID
          relatedStories{
            ...${storiesFragment}
          }
        }
      }`,
    variables: {
      objectID: parseInt(objectId),
    },
  };
}

export function relatedStoriesByTitleQuery(title: string): GraphQLQuery {
  return {
    query: `
	query($storyTitle: String) {
        storiesForObjectIds(where: { relatedStories_some: { storyTitle: $storyTitle } }) {
          id
          objectID
          relatedStories{
			...${storiesFragment}          
			}
        }
      }
	  `,
    variables: {
      storyTitle: title,
    },
  };
}

export function relatedStoriesByRoomIdQuery(objectId: string): GraphQLQuery {
  return {
    query: `
	query($roomID: Int) {
        storiesForRoomIds(where: { roomID: $roomID }) {
          id
          roomID
          relatedStories {
			...${storiesFragment}          
			}
        }
      }
	  `,
    variables: {
      objectID: objectId,
    },
  };
}

export function allStoriesQuery(): GraphQLQuery {
  return {
    query: `
		query {
			storieses{
			  id
			  storyTitle
			  stage
			}
		  }
		`,
    variables: {},
  };
}

export function getObjectByObjectIdQuery(objectId: string): GraphQLQuery {
  return {
    query: `
		query($objectId: String) {
			specialExhibitionObjects(where: {objectId: $objectId}) {
				birthDate
				classification
				creditLine
				culture
				deathDate
				dimensions
				medium
				nationality
				objectId
				people
				title
				visualDescription
				image {
					url
				}
				content {
					... on ContentBlock {
						contentBlock {
							... on Image {
								type
								caption {
									html
								}
								altText
								image {
									url
								}
							}
							... on ImageComparison {
								type
								leftImage {
									altText
									caption {
										html
									}
									image {
										url
									}
								}
								rightImage {
									altText
									caption {
										html
									}
									image {
										url
									}
								}
							}
							... on TextBlock {
								type
								textBlock {
									html
								}
							}
							... on Title {
								type
								subtitle
								title
							}
							... on Video {
								type
								url
							}
						}
					}
				}
			}
		}
		`,
    variables: {
      objectId: objectId,
    },
  };
}
