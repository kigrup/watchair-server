import { HasManyAddAssociationMixin, HasManyGetAssociationsMixin, Model, InferAttributes, InferCreationAttributes, ForeignKey, CreationOptional, DataTypes, Sequelize, NonAttribute, Association } from 'sequelize'
import { logger } from './utils/logger'

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './data/database.sqlite',
  logging: (msg) => logger.log('info', msg)
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

export enum JobType {
  FILE = 'FILE',
  METRIC = 'METRIC'
}

export enum JobSubtype {
  // Type: FILE
  EXCEL = 'EXCEL',
  // Type: METRIC
  REVIEWS_DONE = 'REVIEWS DONE',
  SUBMISSION_ACCEPTANCE = 'SUBMISSION ACCEPTANCE'
}

export class ProcessingJob extends Model<InferAttributes<ProcessingJob>, InferCreationAttributes<ProcessingJob>> {
  declare id: string
  declare domainId: ForeignKey<Domain['id']>

  declare type: JobType
  declare subtype: JobSubtype
  declare subject: string
  declare status: JobStatus
  declare message: string

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

export interface MetricHeaderAttributes {
  id: string

  title: string
  description: string

  valueMin: number
  valueMax: number
  valueStep: number
  valueUnit: string

  domainId: string
}
export class MetricHeader extends Model<InferAttributes<MetricHeader>, InferCreationAttributes<MetricHeader>> implements MetricHeader {
  declare id: string

  declare title: string
  declare description: CreationOptional<string>

  declare valueMin: CreationOptional<number>
  declare valueMax: CreationOptional<number>
  declare valueStep: CreationOptional<number>
  declare valueUnit: string

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare domainId: ForeignKey<Domain['id']>

  declare getMetricValues: HasManyGetAssociationsMixin<MetricValue>
  declare addMetricValue: HasManyAddAssociationMixin<MetricValue, number>

  declare metricValues?: NonAttribute<MetricValue[]>

  declare static associations: {
    metricValues: Association<MetricHeader, MetricValue>
  }
}

export interface MetricValueAttributes {
  id: string
  headerId: string

  value: number
  label: string

  color: `#${string}`
}
export class MetricValue extends Model<InferAttributes<MetricValue>, InferCreationAttributes<MetricValue>> implements MetricValueAttributes {
  declare id: string
  declare headerId: ForeignKey<MetricHeader['id']>

  declare value: number
  declare label: string

  declare color: CreationOptional<`#${string}`>

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  declare metricHeader?: NonAttribute<MetricHeader>
}

export type Metric = MetricHeaderAttributes & { values: MetricValueAttributes[] }

export interface PersonAttributes {
  id: string
  firstName: string | null
  lastName: string | null
  domainId: string
}
export class Person extends Model<InferAttributes<Person>, InferCreationAttributes<Person>> implements PersonAttributes {
  declare id: string
  declare firstName: string | null
  declare lastName: string | null

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  declare domainId: ForeignKey<Domain['id']>
}

export interface AuthorAttributes {
  id: string
  personId: string
}
export class Author extends Model<InferAttributes<Author>, InferCreationAttributes<Author>> implements AuthorAttributes {
  declare id: string
  declare personId: ForeignKey<Person['id']>
}

export interface PCMemberAttributes {
  id: string
  personId: string
}
export class PCMember extends Model<InferAttributes<PCMember>, InferCreationAttributes<PCMember>> implements PCMember {
  declare id: string
  declare personId: ForeignKey<Person['id']>
}

export class ConflictOfInterest extends Model<InferAttributes<ConflictOfInterest>, InferCreationAttributes<ConflictOfInterest>> {
  declare id: string

  declare authorId: ForeignKey<Author['id']>
  declare pcMemberId: ForeignKey<PCMember['id']>
}

export interface SeniorPCMemberAttributes {
  id: string
  pcMemberId: string
}
export class SeniorPCMember extends Model<InferAttributes<SeniorPCMember>, InferCreationAttributes<SeniorPCMember>> implements SeniorPCMemberAttributes {
  declare id: string
  declare pcMemberId: ForeignKey<PCMember['id']>
}

export interface ChairAttributes {
  id: string
  seniorPcMemberId: string
}
export class Chair extends Model<InferAttributes<Chair>, InferCreationAttributes<Chair>> implements ChairAttributes {
  declare id: string
  declare seniorPcMemberId: ForeignKey<SeniorPCMember['id']>
}

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

  declare reviewScoreValue: ForeignKey<ReviewScore['value']>
  declare confidence: ForeignKey<Confidence['value']>

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  declare reviewer?: NonAttribute<PCMember>
  declare reviewScore?: NonAttribute<ReviewScore>
}

export interface ReviewScoreAttributes {
  value: number
  explanation: string
}
export class ReviewScore extends Model<InferAttributes<ReviewScore>, InferCreationAttributes<ReviewScore>> implements ReviewScoreAttributes {
  declare value: number
  declare explanation: string

  declare getReviewsWithThisScore: HasManyGetAssociationsMixin<Review>

  declare reviewsWithThisScore?: NonAttribute<Review[]>

  declare static associations: {
    reviewsWithThisScore: Association<ReviewScore, Review>
  }
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

ProcessingJob.init(
  {
    id: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    subtype: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    subject: {
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
    tableName: 'processingjobs',
    sequelize
  }
)

MetricHeader.init(
  {
    id: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    valueMin: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    valueMax: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    valueStep: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    valueUnit: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    tableName: 'MetricHeaders',
    sequelize
  }
)

MetricValue.init(
  {
    id: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    tableName: 'MetricValues',
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
    }
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
    }
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
    }
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
    }
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
    tableName: 'ReviewScores',
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

Domain.hasMany(ProcessingJob, {
  sourceKey: 'id',
  foreignKey: 'domainId',
  as: 'processingjobs'
})
ProcessingJob.belongsTo(Domain, {
  foreignKey: 'domainId',
  as: 'jobdomain'
})

Domain.hasMany(MetricHeader, {
  sourceKey: 'id',
  foreignKey: 'domainId',
  as: 'metricHeaders'
})
MetricHeader.belongsTo(Domain, {
  foreignKey: 'domainId',
  as: 'metricDomain'
})

MetricHeader.hasMany(MetricValue, {
  sourceKey: 'id',
  foreignKey: 'headerId',
  as: 'metricValues'
})
MetricValue.belongsTo(MetricHeader, {
  foreignKey: 'headerId',
  as: 'metricHeader'
})

Domain.hasMany(Person, {
  sourceKey: 'id',
  foreignKey: 'domainId',
  as: 'persons'
})
Person.belongsTo(Domain, {
  foreignKey: 'domainId',
  as: 'domain'
})

Author.belongsTo(Person, {
  foreignKey: 'personId',
  as: 'person'
})

PCMember.belongsTo(Person, {
  foreignKey: 'personId',
  as: 'person'
})
SeniorPCMember.belongsTo(PCMember, {
  foreignKey: 'pcMemberId',
  as: 'pcMember'
})
Chair.belongsTo(SeniorPCMember, {
  foreignKey: 'seniorPcMemberId',
  as: 'seniorPcMember'
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
  foreignKey: 'submissionId',
  as: 'submission'
})
Submission.hasMany(Assignment, {
  sourceKey: 'id',
  foreignKey: 'submissionId',
  as: 'submissions'
})
Assignment.belongsTo(PCMember, {
  foreignKey: 'pcMemberId',
  as: 'pcmember'
})

PCMember.belongsToMany(Submission, {
  through: Review,
  foreignKey: 'pcMemberId',
  otherKey: 'submissionId',
  as: {
    singular: 'submissionReviewed',
    plural: 'submissionsReviewed'
  }
})
Submission.belongsToMany(PCMember, {
  through: Review,
  foreignKey: 'submissionId',
  otherKey: 'pcMemberId',
  as: {
    singular: 'submissionReviewer',
    plural: 'submissionReviewers'
  }
})
PCMember.hasMany(Review, {
  sourceKey: 'id',
  foreignKey: 'pcMemberId',
  as: 'ownedreviews'
})
Review.belongsTo(Submission, {
  foreignKey: 'submissionId',
  as: 'review'
})
Submission.hasMany(Review, {
  sourceKey: 'id',
  foreignKey: 'submissionId',
  as: 'subjectreviews'
})
Review.belongsTo(PCMember, {
  foreignKey: 'pcMemberId',
  as: 'reviewer'
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
  foreignKey: 'reviewScoreValue',
  as: 'reviewsWithThisScore'
})
Review.belongsTo(ReviewScore, {
  foreignKey: 'reviewScoreValue',
  as: 'reviewScore'
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
