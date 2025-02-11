import { ItineraryVisibility } from "prisma/prisma-client";
import { db } from "../controllers/db";
import { getUserByEmail } from "./user";
import { deliverItineraryCollabEmail } from "../controllers/mail";

// Helper function to check if user is an owner or collaborator
const isUserAuthorized = async (userId: number, itineraryId: number) => {
    const itinerary = await db.itinerary.findUnique({
      where: { id: itineraryId },
      select: {
        owner_id: true,
        collaborators: true,
      },
    });
  
    if (!itinerary) {
      return false;
    }
  
    const isOwner = itinerary.owner_id === userId;
    const isCollaborator = itinerary.collaborators.some((collaborator) => collaborator.id === userId);
  
    return isOwner || isCollaborator;
};

export const createItinerary = async (
    owner_id: number,
    title: string,
    location: string,
    visibility: ItineraryVisibility,
    start_date: Date,
    end_date: Date,
    collaborators: string[] | undefined,
) => {
    const createdItinerary = await db.itinerary.create({
        data: {
            title,
            location,
            visibility,
            start_date,
            end_date,
            owner_id
        }
    })

    const owner = await db.user.findFirst({
        where: {
            id: owner_id
        },
        select: {
            username: true,
        }
    });

    for (const collaboratorEmail of collaborators ?? []) {
        let collaborator = await getUserByEmail(collaboratorEmail);
        if (collaborator && collaborator.id != owner_id) {
            await db.itinerary.update({
                where: { id: createdItinerary.id },
                data: {
                    collaborators: {
                        connect: {id: collaborator.id }
                    },
                },
            });
            await deliverItineraryCollabEmail(collaborator.email, collaborator.email, owner?.username || "", title, location);
        };
    };

    const itinerary = await db.itinerary.findFirst({
        where: { 
            id: createdItinerary.id,
            active: true,
        },
        include: {
            photos: {
                select: {
                    id: true,
                    url: true,
                }
            },
            collaborators: {
                select: {
                    id: true,
                    email: true,
                }
            },
            _count: {
                select: {
                    votes: true,
                }
            },
        },
    });
    
    return itinerary;
}

export const getItineraries = async (page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;
    const itineraries = await db.itinerary.findMany({
        where: { 
            active: true,
            visibility: "public",
        },
        include: {
            photos: {
                select: {
                    id: true,
                    url: true,
                }
            },
            _count: {
                select: {
                    votes: true,
                }
            },
        },
        orderBy: {
            created_at: 'desc',
        },
        skip,
        take: limit,
    }); 

    return itineraries;
}

export const getItineraryById = async (itineraryId: number, requesterUserId: number | null) => {
    const itinerary = await db.itinerary.findFirst({
        where: { 
            id: itineraryId,
            active: true,
        },
        include: {
            photos: {
                select: {
                    id: true,
                    url: true,
                }
            },
            collaborators: {
                select: {
                    id: true,
                    email: true,
                }
            },
            _count: {
                select: {
                    votes: true,
                }
            },
        }
    }); 

    if (itinerary && itinerary.visibility === 'private') {
        return requesterUserId ? await isUserAuthorized(requesterUserId, itineraryId) ? itinerary : null : null;
    }

    return itinerary;
}

export const getCreatedItineraries = async (
    userId: number,
    isOwner: boolean,
    page: number = 1, 
    limit: number = 10
) => {
    const skip = (page - 1) * limit;
    const user = await db.user.findFirst({
        where: {
            id: userId,
        },
        include: {
            itineraries: {
                where: isOwner ? {
                    active: true,
                }: 
                {
                    active: true,
                    visibility: 'public'
                },
                include: {
                    photos: {
                        select: {
                            id: true,
                            url: true,
                        }
                    },
                    collaborators: {
                        select: {
                            id: true,
                            email: true,
                        }
                    },
                    _count: {
                        select: {
                            votes: true,
                        }
                    },
                },
                orderBy: {
                    created_at: 'desc',
                },
                skip,
                take: limit,
            },
        },
    });
    return user?.itineraries;
}

export const getCollabItineraries = async (userId: number, page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;
    const user = await db.user.findFirst({
        where: {
            id: userId,
        },
        include: {
            collaborated_itineraries: {
                where: {
                    active: true,
                },
                include: {
                    photos: {
                        select: {
                            id: true,
                            url: true,
                        }
                    },
                    collaborators: {
                        select: {
                            id: true,
                            email: true,
                        }
                    },
                    _count: {
                        select: {
                            votes: true,
                        }
                    },
                },
                orderBy: {
                    created_at: 'desc',
                },
                skip,
                take: limit,
            },
        },
    });
    return user?.collaborated_itineraries;
}

export const updateItinerary = async (
    itineraryId: number,
    title: string,
    location: string,
    visibility: ItineraryVisibility,
    start_date: Date,
    end_date: Date,
) => {
    let itinerary = await db.itinerary.update({
        where: {
            id: itineraryId,
            active: true,
        },
        data: {
            title,
            location,
            visibility,
            start_date,
            end_date,
        },
        include: {
            photos: {
                select: {
                    id: true,
                    url: true,
                }
            },
            collaborators: {
                select: {
                    id: true,
                    email: true,
                }
            },
            _count: {
                select: {
                    votes: true,
                }
            },
        },
    });

    return itinerary;
}

export const deleteItinerary = async (itineraryId: number) => {
    const count = await db.itinerary.updateMany({
        where: {
          id: itineraryId,
        },
        data: {
          active: false,
        },
    });

    return count;
}