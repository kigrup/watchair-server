import { Model, InferAttributes, InferCreationAttributes, ForeignKey, CreationOptional, DataTypes, Sequelize } from 'sequelize'

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './data/database.sqlite'
})

// Class declarations

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare username: string
  declare hash: string
  declare fullName: string

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

export class Domain extends Model<InferAttributes<Domain>, InferCreationAttributes<Domain>> {
  declare id: string
  declare ownerUsername: CreationOptional<ForeignKey<User['username']>>
  declare name: string

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

export enum JobStatus {
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export class FileProcessingJob extends Model<InferAttributes<FileProcessingJob>, InferCreationAttributes<FileProcessingJob>> {
  declare id: string
  declare domainId: ForeignKey<Domain['id']>

  declare fileName: string
  declare status: JobStatus
  declare message: string

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

/* export class Dashboard extends Model<InferAttributes<Dashboard>, InferCreationAttributes<Dashboard>> {
  declare id: string
} */

export class Person extends Model<InferAttributes<Person>, InferCreationAttributes<Person>> {
  declare id: string
  declare firstName: string | null
  declare lastName: string | null

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  declare domainId: ForeignKey<Domain['id']>
}

export class Author extends Person {}

export class PCMember extends Person {}

export class ConflictOfInterest extends Model<InferAttributes<ConflictOfInterest>, InferCreationAttributes<ConflictOfInterest>> {
  declare id: string

  declare authorId: ForeignKey<Author['id']>
  declare pcMemberId: ForeignKey<PCMember['id']>
}

export class SeniorPCMember extends PCMember {}

export class Chair extends SeniorPCMember {}

export class Topic extends Model<InferAttributes<Topic>, InferCreationAttributes<Topic>> {
  declare title: string
}

export class PCTopic extends Model<InferAttributes<PCTopic>, InferCreationAttributes<PCTopic>> {
  declare id: string

  declare topic: ForeignKey<Topic['title']>
  declare pcMemberId: ForeignKey<PCMember['id']>
}

export class Submission extends Model<InferAttributes<Submission>, InferCreationAttributes<Submission>> {
  declare id: string
  declare title: string

  declare submitted: Date
  declare lastUpdated: Date
  declare decision: ForeignKey<Decision['veredict']>

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

export class SubmissionAutorship extends Model<InferAttributes<SubmissionAutorship>, InferCreationAttributes<SubmissionAutorship>> {
  declare id: string

  declare authorId: ForeignKey<Author['id']>
  declare submissionId: ForeignKey<Submission['id']>
}

export class SubmissionTopic extends Model<InferAttributes<SubmissionTopic>, InferCreationAttributes<SubmissionTopic>> {
  declare id: string

  declare topic: ForeignKey<Topic['title']>
  declare submissionId: ForeignKey<Submission['id']>
}

export class WatchlistEntry extends Model<InferAttributes<WatchlistEntry>, InferCreationAttributes<WatchlistEntry>> {
  declare id: string

  declare pcMemberId: ForeignKey<PCMember['id']>
  declare submissionId: ForeignKey<Submission['id']>
}

export class Assignment extends Model<InferAttributes<Assignment>, InferCreationAttributes<Assignment>> {
  declare id: string

  declare pcMemberId: ForeignKey<PCMember['id']>
  declare submissionId: ForeignKey<Submission['id']>
}

export class Decision extends Model<InferAttributes<Decision>, InferCreationAttributes<Decision>> {
  declare veredict: string
}

export class SubmissionFile extends Model<InferAttributes<SubmissionFile>, InferCreationAttributes<SubmissionFile>> {
  declare id: string
  declare name: string | null
  declare version: string
  declare submitted: Date
}

export class Review extends Model<InferAttributes<Review>, InferCreationAttributes<Review>> {
  declare id: string
  declare submitted: Date

  declare pcMemberId: ForeignKey<PCMember['id']>
  declare submissionId: ForeignKey<Submission['id']>

  declare content: string

  declare reviewScore: ForeignKey<ReviewScore['value']>
  declare confidence: ForeignKey<Confidence['value']>

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

export class ReviewScore extends Model<InferAttributes<ReviewScore>, InferCreationAttributes<ReviewScore>> {
  declare value: number
  declare explanation: string
}

export class Confidence extends Model<InferAttributes<Confidence>, InferCreationAttributes<Confidence>> {
  declare value: number
  declare explanation: string
}

export class Metareview extends Model<InferAttributes<Metareview>, InferCreationAttributes<Metareview>> {
  declare id: string
  declare submitted: Date

  declare pcMemberId: ForeignKey<PCMember['id']>
  declare submissionId: ForeignKey<Submission['id']>

  declare content: string
  declare recommendation: ForeignKey<Recommendation['veredict']>

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

export class Recommendation extends Model<InferAttributes<Recommendation>, InferCreationAttributes<Recommendation>> {
  declare veredict: string
}

export class Comment extends Model<InferAttributes<Comment>, InferCreationAttributes<Comment>> {
  declare id: string
  declare submitted: Date

  declare pcMemberId: ForeignKey<PCMember['id']>
  declare submissionId: ForeignKey<Submission['id']>

  declare content: string

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

export class BidType extends Model<InferAttributes<BidType>, InferCreationAttributes<BidType>> {
  declare title: string
}

export class Bid extends Model<InferAttributes<Bid>, InferCreationAttributes<Bid>> {
  declare id: string
  declare submitted: Date

  declare pcMemberId: ForeignKey<PCMember['id']>
  declare submissionId: ForeignKey<Submission['id']>

  declare type: ForeignKey<BidType['title']>

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

// Classes initializations

User.init(
  {
    username: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    },
    hash: {
      type: new DataTypes.STRING(128),
      allowNull: false
    },
    fullName: {
      type: new DataTypes.STRING(256),
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    tableName: 'users',
    sequelize
  }
)

Domain.init(
  {
    id: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    },
    name: {
      type: new DataTypes.STRING(128),
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    tableName: 'domains',
    sequelize
  }
)

FileProcessingJob.init(
  {
    id: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    },
    fileName: {
      type: DataTypes.STRING(128)
    },
    status: {
      type: DataTypes.STRING(128)
    },
    message: {
      type: DataTypes.STRING(128)
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    tableName: 'fileprocessingjobs',
    sequelize
  }
)

Person.init(
  {
    id: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    },
    firstName: {
      type: new DataTypes.STRING(128),
      allowNull: true
    },
    lastName: {
      type: new DataTypes.STRING(128),
      allowNull: true
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    tableName: 'persons',
    sequelize
  }
)

Author.init(
  {
    id: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    },
    firstName: {
      type: new DataTypes.STRING(128),
      allowNull: true
    },
    lastName: {
      type: new DataTypes.STRING(128),
      allowNull: true
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    tableName: 'authors',
    sequelize
  }
)

PCMember.init(
  {
    id: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    },
    firstName: {
      type: new DataTypes.STRING(128),
      allowNull: true
    },
    lastName: {
      type: new DataTypes.STRING(128),
      allowNull: true
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    tableName: 'pcmembers',
    sequelize
  }
)

ConflictOfInterest.init(
  {
    id: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    }
  },
  {
    tableName: 'conflictsofinterest',
    sequelize
  }
)

SeniorPCMember.init(
  {
    id: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    },
    firstName: {
      type: new DataTypes.STRING(128),
      allowNull: true
    },
    lastName: {
      type: new DataTypes.STRING(128),
      allowNull: true
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    tableName: 'seniorpcmembers',
    sequelize
  }
)

Chair.init(
  {
    id: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    },
    firstName: {
      type: new DataTypes.STRING(128),
      allowNull: true
    },
    lastName: {
      type: new DataTypes.STRING(128),
      allowNull: true
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    tableName: 'chairs',
    sequelize
  }
)

Topic.init(
  {
    title: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    }
  },
  {
    tableName: 'topics',
    sequelize
  }
)

PCTopic.init(
  {
    id: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    }
  },
  {
    tableName: 'pctopics',
    sequelize
  }
)

Submission.init(
  {
    id: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    },
    title: {
      type: new DataTypes.STRING(128),
      allowNull: false
    },
    submitted: {
      type: new DataTypes.DATE(),
      allowNull: false
    },
    lastUpdated: {
      type: new DataTypes.DATE(),
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    tableName: 'submissions',
    sequelize
  }
)

SubmissionAutorship.init(
  {
    id: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    }
  },
  {
    tableName: 'submissionauthorships',
    sequelize
  }
)

SubmissionTopic.init(
  {
    id: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    }
  },
  {
    tableName: 'submissiontopics',
    sequelize
  }
)

WatchlistEntry.init(
  {
    id: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    }
  },
  {
    tableName: 'watchlist',
    sequelize
  }
)

Assignment.init(
  {
    id: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    }
  },
  {
    tableName: 'assignments',
    sequelize
  }
)

Decision.init(
  {
    veredict: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    }
  },
  {
    tableName: 'decisions',
    sequelize
  }
)

SubmissionFile.init(
  {
    id: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    version: DataTypes.NUMBER,
    submitted: DataTypes.DATE
  },
  {
    tableName: 'submissionfiles',
    sequelize
  }
)

Review.init(
  {
    id: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    },
    submitted: DataTypes.DATE,
    content: {
      type: DataTypes.STRING(),
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    tableName: 'reviews',
    sequelize
  }
)

ReviewScore.init(
  {
    value: {
      type: DataTypes.NUMBER,
      autoIncrement: false,
      primaryKey: true
    },
    explanation: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    tableName: 'reviewscores',
    sequelize
  }
)

Confidence.init(
  {
    value: {
      type: DataTypes.NUMBER,
      autoIncrement: false,
      primaryKey: true
    },
    explanation: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    tableName: 'confidences',
    sequelize
  }
)

Metareview.init(
  {
    id: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    },
    submitted: DataTypes.DATE,
    content: {
      type: DataTypes.STRING(),
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    tableName: 'metareviews',
    sequelize
  }
)

Recommendation.init(
  {
    veredict: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    }
  },
  {
    tableName: 'recommendations',
    sequelize
  }
)

Comment.init(
  {
    id: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    },
    submitted: DataTypes.DATE,
    content: {
      type: DataTypes.STRING(),
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    tableName: 'comments',
    sequelize
  }
)

BidType.init(
  {
    title: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    }
  },
  {
    tableName: 'bidtypes',
    sequelize
  }
)

Bid.init(
  {
    id: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    },
    submitted: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    tableName: 'bids',
    sequelize
  }
)

// Associations

User.hasMany(Domain, {
  sourceKey: 'username',
  foreignKey: 'ownerUsername',
  as: 'domains'
})
Domain.belongsTo(User, {
  foreignKey: 'ownerUsername'
})

Domain.hasMany(FileProcessingJob, {
  sourceKey: 'id',
  foreignKey: 'domainId',
  as: 'fileprocessingjobs'
})
FileProcessingJob.belongsTo(Domain, {
  foreignKey: 'domainId'
})

Domain.hasMany(Person, {
  sourceKey: 'id',
  foreignKey: 'domainId',
  as: 'persons'
})
Person.belongsTo(Domain, {
  foreignKey: 'domainId'
})

Domain.hasMany(Author, {
  sourceKey: 'id',
  foreignKey: 'domainId',
  as: 'authors'
})
Author.belongsTo(Domain, {
  foreignKey: 'domainId'
})

Domain.hasMany(PCMember, {
  sourceKey: 'id',
  foreignKey: 'domainId',
  as: 'pcmembers'
})
PCMember.belongsTo(Domain, {
  foreignKey: 'domainId'
})

Domain.hasMany(SeniorPCMember, {
  sourceKey: 'id',
  foreignKey: 'domainId',
  as: 'seniorpcmembers'
})
SeniorPCMember.belongsTo(Domain, {
  foreignKey: 'domainId'
})

Domain.hasMany(Chair, {
  sourceKey: 'id',
  foreignKey: 'domainId',
  as: 'chairs'
})
Chair.belongsTo(Domain, {
  foreignKey: 'domainId'
})

Author.belongsToMany(PCMember, { through: ConflictOfInterest })
PCMember.belongsToMany(Author, { through: ConflictOfInterest })
Author.hasMany(ConflictOfInterest)
ConflictOfInterest.belongsTo(PCMember)
PCMember.hasMany(ConflictOfInterest)
ConflictOfInterest.belongsTo(Author)

Author.belongsToMany(Submission, { through: SubmissionAutorship })
Submission.belongsToMany(Author, { through: SubmissionAutorship })
Author.hasMany(SubmissionAutorship)
SubmissionAutorship.belongsTo(Submission)
Submission.hasMany(SubmissionAutorship)
SubmissionAutorship.belongsTo(Author)

Author.belongsToMany(Submission, { through: SubmissionFile })
Submission.belongsToMany(Author, { through: SubmissionFile })
Author.hasMany(SubmissionFile)
SubmissionFile.belongsTo(Submission)
Submission.hasMany(SubmissionFile)
SubmissionFile.belongsTo(Author)

PCMember.belongsToMany(Topic, { through: PCTopic })
Topic.belongsToMany(PCMember, { through: PCTopic })
PCMember.hasMany(PCTopic)
PCTopic.belongsTo(Topic)
Topic.hasMany(PCTopic)
PCTopic.belongsTo(PCMember)

Submission.belongsToMany(Topic, { through: SubmissionTopic })
Topic.belongsToMany(Submission, { through: SubmissionTopic })
Submission.hasMany(SubmissionTopic)
SubmissionTopic.belongsTo(Topic)
Topic.hasMany(SubmissionTopic)
SubmissionTopic.belongsTo(Submission)

PCMember.belongsToMany(Submission, { through: WatchlistEntry })
Submission.belongsToMany(PCMember, { through: WatchlistEntry })
PCMember.hasMany(WatchlistEntry)
WatchlistEntry.belongsTo(Submission)
Submission.hasMany(WatchlistEntry)
WatchlistEntry.belongsTo(PCMember)

PCMember.belongsToMany(Submission, { through: Assignment, foreignKey: 'pcMemberId', otherKey: 'submissionId' })
Submission.belongsToMany(PCMember, { through: Assignment, foreignKey: 'submissionId', otherKey: 'pcMemberId' })
PCMember.hasMany(Assignment, {
  sourceKey: 'id',
  foreignKey: 'pcMemberId',
  as: 'pcmembers'
})
Assignment.belongsTo(Submission, {
  foreignKey: 'submissionId'
})
Submission.hasMany(Assignment, {
  sourceKey: 'id',
  foreignKey: 'submissionId',
  as: 'submissions'
})
Assignment.belongsTo(PCMember, {
  foreignKey: 'pcMemberId'
})

PCMember.belongsToMany(Submission, { through: Review, foreignKey: 'pcMemberId', otherKey: 'submissionId' })
Submission.belongsToMany(PCMember, { through: Review, foreignKey: 'submissionId', otherKey: 'pcMemberId' })
PCMember.hasMany(Review, {
  sourceKey: 'id',
  foreignKey: 'pcMemberId',
  as: 'ownedreviews'
})
Review.belongsTo(Submission, {
  foreignKey: 'submissionId'
})
Submission.hasMany(Review, {
  sourceKey: 'id',
  foreignKey: 'submissionId',
  as: 'subjectreviews'
})
Review.belongsTo(PCMember, {
  foreignKey: 'pcMemberId'
})

Confidence.hasMany(Review, {
  sourceKey: 'value',
  foreignKey: 'confidence',
  as: 'reviews'
})
Review.belongsTo(Confidence, {
  foreignKey: 'confidence'
})

ReviewScore.hasMany(Review, {
  sourceKey: 'value',
  foreignKey: 'reviewScore',
  as: 'reviews'
})
Review.belongsTo(ReviewScore, {
  foreignKey: 'reviewScore'
})

Decision.hasMany(Submission, {
  sourceKey: 'veredict',
  foreignKey: 'decision',
  as: 'submissions'
})
Submission.belongsTo(Decision, {
  foreignKey: 'decision'
})

PCMember.belongsToMany(Submission, { through: Bid })
Submission.belongsToMany(PCMember, { through: Bid })
PCMember.hasMany(Bid)
Bid.belongsTo(Submission)
Submission.hasMany(Bid)
Bid.belongsTo(PCMember)

BidType.hasMany(Bid, {
  sourceKey: 'title',
  foreignKey: 'type',
  as: 'bids'
})
Bid.belongsTo(BidType, {
  foreignKey: 'type'
})

SeniorPCMember.belongsToMany(Submission, { through: Recommendation })
Submission.belongsToMany(SeniorPCMember, { through: Recommendation })
SeniorPCMember.hasMany(Recommendation)
Recommendation.belongsTo(Submission)
Submission.hasMany(Recommendation)
Recommendation.belongsTo(SeniorPCMember)

Recommendation.hasMany(Metareview, {
  sourceKey: 'veredict',
  foreignKey: 'recommendation',
  as: 'metareviews'
})
Metareview.belongsTo(Recommendation, {
  foreignKey: 'recommendation'
})
