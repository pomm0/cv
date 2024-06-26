import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  amount: () => parseFloat(faker.finance.amount())
});
