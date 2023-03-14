import { Sequelize, Op } from "sequelize";
import Contact from "../../models/Contact";
import User from "../../models/User";
import Ticket from "../../models/Ticket";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  tenantId: string | number;
}

interface Response {
  contacts: Contact[];
  count: number;
  hasMore: boolean;
}

const ListContactsService = async ({
  searchParam = "",
  pageNumber = "1",
  tenantId
}: Request): Promise<Response> => {
  const whereCondition = {
    tenantId,
    [Op.or]: [
      {
        name: Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("Contact.name")),
          "LIKE",
          `%${searchParam.toLowerCase().trim()}%`
        )
      },
      { number: { [Op.like]: `%${searchParam.toLowerCase().trim()}%` } }
    ]
  };
  const limit = 40;
  const offset = limit * (+pageNumber - 1);

  /*const { count, rows: contacts } = await Contact.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["name", "ASC"]],  
    include: [
      { 
        model: User,
        required: false
      }
    ]
    // subQuery: true
  });*/

  const { count, rows: contacts } = await Contact.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["name", "ASC"]],  
    include: [
      { 
        model: Ticket,
        required: true,
        include: [
          { 
            model: User,
            required: false
          }
        ]
      }
    ]
    // subQuery: true
  });




  const hasMore = count > offset + contacts.length;

  return {
    contacts,
    count,
    hasMore
  };
};

export default ListContactsService;
