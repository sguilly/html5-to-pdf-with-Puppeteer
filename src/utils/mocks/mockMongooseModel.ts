import { getModelToken } from '@nestjs/mongoose';

const mongooseMock: any = jest.fn();

mongooseMock.prototype.save = jest.fn();

mongooseMock.updateOne = jest.fn();
mongooseMock.updateMany = jest.fn();
mongooseMock.findByIdAndDelete = jest.fn();
mongooseMock.find = jest.fn();
mongooseMock.findOne = jest.fn();
mongooseMock.findOneAndUpdate = jest.fn();
mongooseMock.findById = jest.fn();
mongooseMock.create = jest.fn();
mongooseMock.aggregate = jest.fn();
mongooseMock.deleteOne = jest.fn();
mongooseMock.countDocuments = jest.fn();

const mongooseQueryMock = {
  exec: jest.fn(),
};

function execPromise(value) {
  return { exec: () => Promise.resolve(value) };
}

function execReject(value) {
  return { exec: () => Promise.reject(value) };
}

function execLeanPromise(value) {
  return {
    lean: () => {
      return { exec: () => Promise.resolve(value) };
    },
  };
}

const MockMongooseModel = (
  name: string,
  connection?: string,
): { useValue: any; provide: string } => {
  return {
    provide: getModelToken(name, connection),
    useValue: mongooseMock,
  };
};

export {
  MockMongooseModel,
  mongooseMock,
  mongooseQueryMock,
  execPromise,
  execReject,
  execLeanPromise,
};
