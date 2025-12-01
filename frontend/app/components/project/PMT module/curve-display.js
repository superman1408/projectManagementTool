import React, { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
// import Curve from "../CurveDisplay/Scurve/Curve";
import { useDispatch, useSelector } from "react-redux";
import { getPosts, update } from "../../action/posts";
import { useParams } from "react-router-dom";
import LineGraph from "./SCurve/LineGraph";

const CurveDisplay = () => {
  const [dialogOpen, setDialogOpen] = useState();

  const { id } = useParams();

  const dispatch = useDispatch();

  const [currentPostId, setCurrentPostId] = useState(null); // Add state for current post ID

  const [formData, setFormData] = useState({
    growthRate: "",
  });

  useEffect(() => {
    dispatch(getPosts());
  }, [dispatch]);

  // const [formData, setFormData] = useState({
  // growthRate:"0.3",
  // })

  const posts = useSelector((state) => state.posts);

  const openCard = (postid) => {
    setDialogOpen(true);
    setCurrentPostId(postid);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    setDialogOpen(false);

    const existingPost = posts.find((post) => post._id === currentPostId);

    if (!existingPost) {
      // console.error("No existing project found!");
      return;
    }

    const updatedData = {
      ...existingPost,
      growthRate: formData.growthRate || existingPost.growthRate,
    };

    await dispatch(update(currentPostId, updatedData));
    setFormData({ growthRate: "" });
    window.location.reload();
  };

  return (
    <>
      <div className="mb-8">
        {posts.map((post, index) => {
          const isoDate = post?.updatedAt;
          const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            // hour: "2-digit",
            // minute: "2-digit",
            // second: "2-digit",
            // hour12: true,
            timeZone: "UTC",
          };

          const formattedDate = new Intl.DateTimeFormat(
            "en-US",
            options
          ).format(new Date(isoDate));

          const currentDate = new Date();

          if (post.projectNumber === id) {
            return (
              <div className="flex justify-between items-center bg-gray-100 rounded ">
                <div className="p-2">
                  <h1 className="font-bold text-lg">Overview</h1>
                  <h3 className=" font-semi-bold text-xs">
                    {/* bg-gray-700 text-white rounded-lg */}
                    Last Updated Growth Rate At : {formattedDate}
                  </h3>
                </div>

                {/* <h3 className="p-3 font-bold text-sm">
                  {post?.commencementDate}-{post?.endDate}
                  {post?.updatedAt}
                </h3> */}

                <button
                  onClick={() => openCard(post._id)}
                  title="Add Growth Rate"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fillRule="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                  </svg>
                </button>
              </div>
            );
          }
        })}

        {posts.map((post, index) => {
          const dateCommence = new Date(post?.commencementDate);
          const dateEnd = new Date(post?.endDate);
          const timeDifference = dateEnd - dateCommence;
          const duration = timeDifference / (1000 * 60 * 60 * 24 * 30);
          const midpoint = duration / 2;
          const currentgrowthRate = post?.growthRate;
          // console.log(currentgrowthRate);

          if (post.projectNumber === id) {
            return (
              <div>
                {/* <Curve
                  duration1={duration}
                  midpoint1={midpoint}
                  growthRate1={currentgrowthRate}
                  exponent1={1}
                  duration2={duration}
                  midpoint2={midpoint}
                  // growthRate2={1.9}

                  exponent2={1}
                  dateCommence={dateCommence}
                  duration3={duration}
                  midpoint3={midpoint}
                  // growthRate2={1.9}

                  exponent3={1}
                  dateCommence1={dateCommence}
                  duration={duration}
                  midpoint={midpoint}
                  growthRate={currentgrowthRate}
                  exponent={1}
                  totalGrowth={currentgrowthRate} // 85% growth
                  // dateCommence={new Date("2024-01-01")}
                /> */}
                <LineGraph
                  key={index}
                  dateCommence={dateCommence}
                  dateEnd={dateEnd}
                  workCompleted={currentgrowthRate}
                />
              </div>
            );
          }
        })}
      </div>

      <Modal
        show={dialogOpen}
        onHide={() => setDialogOpen(false)}
        centered
        style={{ padding: "12px", marginTop: "10vh" }}
        // scrollable
      >
        <Modal.Header closeButton></Modal.Header>

        <form onSubmit={handleSubmit}>
          <Modal.Body
            style={{ maxHeight: "300px", overflowY: "auto" }}
            scrollable
          >
            <div className="p-3 flex">
              <label>Current Project Status : </label>
              <input
                className=" bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md ml-3
                 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                type="text"
                name="growthRate"
                value={formData.growthRate}
                onChange={handleFormChange}
                required
              />
            </div>
          </Modal.Body>
          {/* 9) The average age of the committee of 10 members is 40 years. A member of age 52 retires and a new member of age 38 takes his place. What is the average age of the present committee?
           */}

          {/* I want to calculate requiredgrowthrate on the provided growth till the current month from whole duration how to doi it */}
          <div className="bg-gray-100 px-2 py-2 sm:flex sm:flex-row-reverse sm:px-6">
            <Button
              type="submit"
              variant="primary"
              // onClick={handleAccept}
              style={{ display: "flex", float: "right", marginRight: "5px" }}
            >
              Proceed
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default CurveDisplay;
