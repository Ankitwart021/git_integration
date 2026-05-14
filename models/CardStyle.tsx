
import React from 'react';
import { JSX } from "react"
// import { CARD_ATTR_IMG } from '../constants';
import { CARD_ATTR_DESC, CARD_ATTR_IMG, CARD_ATTR_META, CARD_ATTR_TITLE, CARD_VIEW_STYLE } from '../constants';

export default class CardStyle {
    public type: string = CARD_VIEW_STYLE;

    public serialise(): string {
        return JSON.stringify({ type: this.type });
    }

    public static deserialise(str: string): CardStyle | null {
        try {
            const desJSON = JSON.parse(str);
            if (desJSON.type !== CARD_VIEW_STYLE) {
                return null;
            }
            return new CardStyle();
        } catch (e) {
            console.error("Error deserialising CardStyle:", e);
            return null;
        }

    }


    public getStyledHtml(data: Record<string, any>[], attrMapp: Map<string, string>, op?: string): JSX.Element | null {
        return (
            <div className="custom-view-card-container row" >
                {/* <div className="custom-view-card-container" style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}> */}
                {data.length > 0 ? (data.map((item, index) => (
                    // <div key={index} className="card" style={{ width: "18rem", flex: "0 0 auto" }}>
                    <>
                        <div key={index} className="card w-100 " >
                            <div className="card-body">
                                {/* <img src={String(item[attrMapp.get(CARD_ATTR_IMG) || ''])} className="card-img-top" alt="..." /> */}
                                <small className="text-muted">{String(item[attrMapp.get(CARD_ATTR_META) || ''])}</small>
                                <h5 className="card-title">{String(item[attrMapp.get(CARD_ATTR_TITLE) || ''])}</h5>
                                <p className="card-text">{String(item[attrMapp.get(CARD_ATTR_DESC) || ''])}</p>

                                <div
                                    className="position-absolute d-flex gap-2"
                                    style={{ top: "10px", right: "10px", zIndex: 2 }}
                                >
                                    {/* Edit */}
                                    
                                        <i
                                            className="fa fa-edit text-primary cursor-pointer"
                                            title="Edit"
                                            onClick={() => {
                                                console.log("Edit card clicked:", item);
                                            }}
                                        />
                                    

                                    {/* Delete */}
                                    <i
                                        className="fa fa-trash text-danger cursor-pointer"
                                        title="Delete"
                                        onClick={() => {
                                            console.log("Delete card clicked:", item);
                                        }}
                                    />
                                </div>



                            </div>
                        </div>
                    </>
                ))) :
                    //  (<div className='border p-1'>Select a resource to view data</div>)
                    (<div>Add Data in Data Tab</div>)
                }
            </div >
        );
    }
}