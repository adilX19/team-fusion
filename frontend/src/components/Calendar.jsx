import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from '@fullcalendar/interaction';
import axios from "axios";
import MeetingFormModal from "./MeetingFormModal.jsx";

const Calendar = () => {
    const [meetings, setMeetings] = useState([]);
    const [modalDate, setModalDate] = useState(null);

    const fetchMeetings = async () => {
        const res = await axios.get("http://localhost:5000/calendar/meetings");
        setMeetings(
            res.data.map((m) => ({
                title: m.title,
                date: m.date,
                id: m.id,
            }))
        );
    };

    useEffect(() => {
        fetchMeetings();
    }, []);

    return (
        <div>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={meetings}
                dateClick={(info) => {
                    console.log("Meeting date clicked")
                    setModalDate(info.dateStr)
                }}
            />
            {modalDate ? <MeetingFormModal
                date={modalDate}
                visible={!!modalDate}
                onClose={() => setModalDate(null)}
                onSave={fetchMeetings}
            />: ""}
        </div>
    );
};

export default Calendar;
