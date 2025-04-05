import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { TITLE_TAILWIND_CLASS } from "@/utils/constants"

export function AccordionComponent() {
    return (
        <div className="flex flex-col w-[70%] lg:w-[50%]">
            <h2 className={`${TITLE_TAILWIND_CLASS} mt-2 font-semibold text-center tracking-tight dark:text-white text-gray-900`}>
                Frequently Asked Questions (FAQs)
            </h2>
            <Accordion type="single" collapsible className="w-full mt-2">
                <AccordionItem value="item-1">
                    <AccordionTrigger><span className="font-medium">How does CodeTrack track my coding time?</span></AccordionTrigger>
                    <AccordionContent>
                        <p>CodeTrack intelligently monitors your active coding sessions, allowing you to start a timer when you begin coding and automatically tracking your time. You can also manually log time for past coding sessions.</p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger><span className="font-medium">What's the difference between Projects and Courses?</span></AccordionTrigger>
                    <AccordionContent>
                        <p>Projects are designed for tracking professional work or personal coding projects, while Courses are specifically for tracking time spent on learning and educational activities. This separation helps you better understand how you split your time between learning and practical work.</p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger><span className="font-medium">Can I export my tracking data?</span></AccordionTrigger>
                    <AccordionContent>
                        <p>Yes, CodeTrack allows you to export your time tracking data and analytics in various formats, making it easy to use your data in reports or other tools.</p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                    <AccordionTrigger><span className="font-medium">Is there a mobile app available?</span></AccordionTrigger>
                    <AccordionContent>
                        <p>Currently, CodeTrack is optimized for desktop use where most coding happens. A mobile companion app is in our roadmap for viewing stats and managing activities on the go.</p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                    <AccordionTrigger><span className="font-medium">How secure is my tracking data?</span></AccordionTrigger>
                    <AccordionContent>
                        <p>Your data is securely stored and encrypted. We use industry-standard security practices to ensure your tracking information remains private and protected.</p>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
