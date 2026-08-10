export const loginschema = {
  email: {
    isEmail: {
      errorMessage: 'Email must be correct',
    },
    notEmpty: {
      errorMessage: 'Email must be included',
    },
  },
  password: {
    notEmpty: {
      errorMessage: 'New password is required',
    },
    isLength: {
      options: {
        min: 8,
        max: 32,
      },
      errorMessage: 'Password must be between 8 and 32 characters',
    },
  },
};

export const updateProfileSchema = {
  name: {
    notEmpty: {
      errorMessage: 'name must be included',
    },
    isLength: {
      options: {
        min: 3,
        max: 32,
      },
      errorMessage: 'name must be between 8 and 32 characters',
    },
  },
  email: {
    isEmail: {
      errorMessage: 'Email must be correct',
    },
    notEmpty: {
      errorMessage: 'Email must be included',
    },
  },
  phone: {
    isLength: {
      options: {
        min: 11,
        max: 11,
      },
      errorMessage: 'Enter correct phone Number',
    },
    notEmpty: {
      errorMessage: 'Phone must be included',
    },
  },
};

export const changePassSchema = {
  currentPassword: {
    notEmpty: {
      errorMessage: 'New password is required',
    },
  },
  newPassword: {
    notEmpty: {
      errorMessage: 'New password is required',
    },
    isLength: {
      options: {
        min: 8,
        max: 32,
      },
      errorMessage: 'Password must be between 8 and 32 characters',
    },
    matches: {
      options: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]+$/,
      ],
      errorMessage:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  },
};

export const gradeSchema = {
  name: {
    notEmpty: {
      errorMessage: 'name must be included',
    },
    isLength: {
      options: {
        min: 3,
        max: 32,
      },
      errorMessage: 'name must be between 8 and 32 characters',
    },
  },
  session: {
    notEmpty: {
      errorMessage: 'session must be included',
    },
  },
};

export const studentSchema = {
  name: {
    trim: true,
    notEmpty: {
      errorMessage: 'Name is required',
    },
    isLength: {
      options: { min: 3, max: 32 },
      errorMessage: 'Name must be between 3 and 32 characters',
    },
  },
  studying: {
    notEmpty: {
      errorMessage: 'Grade is required',
    },
  },
  gradeId: {
    notEmpty: {
      errorMessage: 'Grade is required',
    },
    isMongoId: {
      errorMessage: 'Invalid Grade ID',
    },
  },
};
