export type GraphQLQuery = {
  query: string;
  variables: { [key: string]: string | number };
};

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

export function relatedStoriesByTitleQuery(objectId: string): GraphQLQuery {
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
      objectID: parseInt(objectId),
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
